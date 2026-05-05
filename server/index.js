import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import db from "./db.js";
import { authMiddleware, hashPassword, issueToken, verifyPassword } from "./auth.js";
import { ALL_TEMPLATE_IDS, FREE_TEMPLATE_IDS, TEMPLATE_PRICE_INR } from "./templateCatalog.js";

const app = express();
const PORT = Number(process.env.API_PORT || 3001);
const CCAVENUE_MERCHANT_ID = (process.env.CCAVENUE_MERCHANT_ID || "").trim();
const CCAVENUE_ACCESS_CODE = (process.env.CCAVENUE_ACCESS_CODE || "").trim();
const CCAVENUE_WORKING_KEY = (process.env.CCAVENUE_WORKING_KEY || "").trim();
const CCAVENUE_ENV = (process.env.CCAVENUE_ENV || "sandbox").trim().toLowerCase();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
const NODE_ENV = process.env.NODE_ENV || "development";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "..", "dist");
const CCAVENUE_PAYMENT_URL = (process.env.CCAVENUE_PAYMENT_URL || "").trim() || (CCAVENUE_ENV === "production"
  ? "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"
  : "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction");

if (!CCAVENUE_MERCHANT_ID || !CCAVENUE_ACCESS_CODE || !CCAVENUE_WORKING_KEY) {
  console.warn("CCAvenue is not configured. Set CCAVENUE_MERCHANT_ID, CCAVENUE_ACCESS_CODE and CCAVENUE_WORKING_KEY in .env");
}

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.length === 0) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const ccavenueIv = Buffer.from([...Array(16).keys()]);

const getCcavenueAesKey = (workingKey) => crypto.createHash("md5").update(workingKey).digest();

const encryptCcavenue = (plainText, workingKey) => {
  const cipher = crypto.createCipheriv("aes-128-cbc", getCcavenueAesKey(workingKey), ccavenueIv);
  return Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]).toString("hex");
};

const decryptCcavenue = (encryptedHex, workingKey) => {
  const decipher = crypto.createDecipheriv("aes-128-cbc", getCcavenueAesKey(workingKey), ccavenueIv);
  return Buffer.concat([decipher.update(encryptedHex, "hex"), decipher.final()]).toString("utf8");
};

const parseCcavenueResponse = (payload) => {
  const parsed = {};
  const params = new URLSearchParams(payload);
  for (const [key, value] of params.entries()) {
    parsed[key] = value;
  }
  return parsed;
};

const formatInrAmount = (inrAmount) => Number(inrAmount).toFixed(2);

const buildFrontendRedirectUrl = (baseUrl, status, internalOrderId, message) => {
  const safeBase = (baseUrl || "").replace(/\/$/, "");
  const targetBase = safeBase || "/pricing";
  const separator = targetBase.includes("?") ? "&" : "?";
  return `${targetBase}${separator}payment=${encodeURIComponent(status)}&orderId=${encodeURIComponent(String(internalOrderId))}&message=${encodeURIComponent(message)}`;
};

const maskSecret = (value) => {
  const v = String(value || "");
  if (!v) return "";
  if (v.length <= 6) return `${v.slice(0, 1)}***${v.slice(-1)}`;
  return `${v.slice(0, 3)}***${v.slice(-3)}`;
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: NODE_ENV });
});

app.post("/api/auth/signup", async (req, res) => {
  const { email, password, fullName } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: "Email already exists" });

  const passwordHash = await hashPassword(password);
  const info = db
    .prepare("INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)")
    .run(email.toLowerCase(), passwordHash, fullName || "");

  const user = db
    .prepare("SELECT id, email, full_name FROM users WHERE id = ?")
    .get(info.lastInsertRowid);

  const token = issueToken(user);
  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, fullName: user.full_name },
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db
    .prepare("SELECT id, email, full_name, password_hash FROM users WHERE email = ?")
    .get(email.toLowerCase());
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = issueToken(user);
  return res.json({
    token,
    user: { id: user.id, email: user.email, fullName: user.full_name },
  });
});

app.post("/api/auth/google", async (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: "Google sign-in is not configured" });
  }

  const { idToken } = req.body ?? {};
  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json({ error: "Google ID token is required" });
  }

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!response.ok) {
      return res.status(401).json({ error: "Invalid Google token" });
    }

    const payload = await response.json();
    if (payload.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: "Google client mismatch" });
    }
    if (payload.email_verified !== "true") {
      return res.status(401).json({ error: "Google email is not verified" });
    }
    if (!payload.email) {
      return res.status(401).json({ error: "Google account email is missing" });
    }

    const email = String(payload.email).toLowerCase();
    let user = db
      .prepare("SELECT id, email, full_name FROM users WHERE email = ?")
      .get(email);

    if (!user) {
      const generatedHash = crypto.randomBytes(32).toString("hex");
      const displayName = payload.name || email.split("@")[0] || "";
      const info = db
        .prepare("INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)")
        .run(email, generatedHash, displayName);
      user = db
        .prepare("SELECT id, email, full_name FROM users WHERE id = ?")
        .get(info.lastInsertRowid);
    }

    const token = issueToken(user);
    return res.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.full_name },
    });
  } catch {
    return res.status(502).json({ error: "Unable to verify Google account" });
  }
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  const user = db
    .prepare("SELECT id, email, full_name FROM users WHERE id = ?")
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user: { id: user.id, email: user.email, fullName: user.full_name } });
});

app.get("/api/templates/purchases", authMiddleware, (req, res) => {
  const rows = db
    .prepare("SELECT template_id FROM purchased_templates WHERE user_id = ?")
    .all(req.user.id);
  return res.json({ templateIds: rows.map((r) => r.template_id) });
});

app.get("/api/checkout/config", authMiddleware, (_req, res) => {
  if (!CCAVENUE_MERCHANT_ID || !CCAVENUE_ACCESS_CODE || !CCAVENUE_WORKING_KEY) {
    return res.status(500).json({ error: "Payment gateway is not configured" });
  }
  return res.json({ provider: "ccavenue" });
});

const requireAuthForDebugConfig = NODE_ENV === "development"
  ? (_req, _res, next) => next()
  : authMiddleware;

app.get("/api/checkout/debug-config", requireAuthForDebugConfig, (_req, res) => {
  const paymentUrlHost = (() => {
    try {
      return new URL(CCAVENUE_PAYMENT_URL).host;
    } catch {
      return "";
    }
  })();

  return res.json({
    provider: "ccavenue",
    env: CCAVENUE_ENV,
    paymentUrlHost,
    merchantIdMasked: maskSecret(CCAVENUE_MERCHANT_ID),
    accessCodeMasked: maskSecret(CCAVENUE_ACCESS_CODE),
    workingKeyMasked: maskSecret(CCAVENUE_WORKING_KEY),
    merchantIdLength: CCAVENUE_MERCHANT_ID.length,
    accessCodeLength: CCAVENUE_ACCESS_CODE.length,
    workingKeyLength: CCAVENUE_WORKING_KEY.length,
    configured: Boolean(CCAVENUE_MERCHANT_ID && CCAVENUE_ACCESS_CODE && CCAVENUE_WORKING_KEY),
  });
});

app.post("/api/checkout/create-order", authMiddleware, (req, res) => {
  if (!CCAVENUE_MERCHANT_ID || !CCAVENUE_ACCESS_CODE || !CCAVENUE_WORKING_KEY) {
    return res.status(500).json({ error: "Payment gateway is not configured" });
  }

  const bodyTemplateIds = Array.isArray(req.body?.templateIds) ? req.body.templateIds : [];
  const uniqueTemplateIds = [...new Set(bodyTemplateIds)].filter((id) => typeof id === "string");
  const validTemplateIds = uniqueTemplateIds.filter((id) => ALL_TEMPLATE_IDS.has(id));
  const paidTemplateIds = validTemplateIds.filter((id) => !FREE_TEMPLATE_IDS.has(id));

  if (paidTemplateIds.length === 0) {
    return res.status(400).json({ error: "No paid templates selected" });
  }

  const placeholders = paidTemplateIds.map(() => "?").join(",");
  const ownedRows = db
    .prepare(
      `SELECT template_id FROM purchased_templates
       WHERE user_id = ? AND template_id IN (${placeholders})`
    )
    .all(req.user.id, ...paidTemplateIds);
  const owned = new Set(ownedRows.map((row) => row.template_id));
  const payableTemplateIds = paidTemplateIds.filter((id) => !owned.has(id));

  if (payableTemplateIds.length === 0) {
    return res.status(400).json({ error: "All selected templates are already owned" });
  }

  const totalInr = payableTemplateIds.length * TEMPLATE_PRICE_INR;
  const amountPaise = totalInr * 100;
  const frontendBaseUrl = typeof req.body?.returnUrl === "string" && req.body.returnUrl.trim()
    ? req.body.returnUrl.trim()
    : (req.headers.origin || "");
  const redirectUrl = `${req.protocol}://${req.get("host")}/api/checkout/ccavenue/response`;
  const cancelUrl = redirectUrl;

  const orderInsert = db
    .prepare(
      `INSERT INTO orders (user_id, status, total_inr, amount_paise, currency)
       VALUES (?, 'created', ?, ?, 'INR')`
    )
    .run(req.user.id, totalInr, amountPaise);

  const internalOrderId = Number(orderInsert.lastInsertRowid);
  const providerOrderId = `rb_${internalOrderId}_${Date.now()}`;

  const insertOrderItem = db.prepare(
    `INSERT INTO order_items (order_id, template_id, amount_inr)
     VALUES (?, ?, ?)`
  );
  const insertItems = db.transaction((templateIds) => {
    for (const templateId of templateIds) {
      insertOrderItem.run(internalOrderId, templateId, TEMPLATE_PRICE_INR);
    }
  });
  insertItems(payableTemplateIds);

  const requestPayload = new URLSearchParams({
    merchant_id: CCAVENUE_MERCHANT_ID,
    order_id: providerOrderId,
    currency: "INR",
    amount: formatInrAmount(totalInr),
    redirect_url: redirectUrl,
    cancel_url: cancelUrl,
    language: "EN",
    merchant_param1: String(internalOrderId),
    merchant_param2: String(req.user.id),
    merchant_param3: frontendBaseUrl,
    billing_email: req.user.email || "",
  }).toString();

  const encRequest = encryptCcavenue(requestPayload, CCAVENUE_WORKING_KEY);
  db.prepare("UPDATE orders SET provider_order_id = ? WHERE id = ?").run(providerOrderId, internalOrderId);

  return res.status(201).json({
    internalOrderId,
    paymentUrl: CCAVENUE_PAYMENT_URL,
    accessCode: CCAVENUE_ACCESS_CODE,
    encRequest,
    amountPaise,
    currency: "INR",
    templateIds: payableTemplateIds,
  });
});

app.post("/api/checkout/verify", authMiddleware, (req, res) => {
  return res.status(410).json({ error: "Deprecated endpoint. Use CCAvenue callback flow." });
});

app.get("/api/checkout/order-status/:internalOrderId", authMiddleware, (req, res) => {
  const internalOrderId = Number(req.params.internalOrderId);
  if (!Number.isInteger(internalOrderId) || internalOrderId <= 0) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  const order = db
    .prepare("SELECT id, user_id, status, provider_payment_id FROM orders WHERE id = ?")
    .get(internalOrderId);

  if (!order || order.user_id !== req.user.id) {
    return res.status(404).json({ error: "Order not found" });
  }

  const orderItems = db.prepare("SELECT template_id FROM order_items WHERE order_id = ?").all(order.id);
  return res.json({
    internalOrderId,
    status: order.status,
    paymentId: order.provider_payment_id || null,
    templateIds: orderItems.map((item) => item.template_id),
  });
});

app.post("/api/checkout/ccavenue/response", (req, res) => {
  if (!CCAVENUE_WORKING_KEY) {
    return res.status(500).send("Payment gateway is not configured");
  }

  const encResp = typeof req.body?.encResp === "string" ? req.body.encResp : "";
  if (!encResp) {
    return res.status(400).send("Missing encResp");
  }

  let parsed;
  try {
    parsed = parseCcavenueResponse(decryptCcavenue(encResp, CCAVENUE_WORKING_KEY));
  } catch {
    return res.status(400).send("Invalid payment response");
  }

  const providerOrderId = parsed.order_id || "";
  const internalOrderId = Number(parsed.merchant_param1 || 0);
  const frontendUrl = parsed.merchant_param3 || "";
  const orderStatus = String(parsed.order_status || "").toLowerCase();
  const trackingId = parsed.tracking_id || parsed.bank_ref_no || "";

  const order = db
    .prepare("SELECT id, user_id, status, provider_order_id FROM orders WHERE id = ?")
    .get(internalOrderId);

  if (!order || order.provider_order_id !== providerOrderId) {
    return res.redirect(buildFrontendRedirectUrl(frontendUrl, "failed", internalOrderId || 0, "Order mismatch"));
  }

  if (order.status === "paid") {
    return res.redirect(buildFrontendRedirectUrl(frontendUrl, "success", internalOrderId, "Payment already confirmed"));
  }

  if (orderStatus === "success") {
    const orderItems = db.prepare("SELECT template_id, amount_inr FROM order_items WHERE order_id = ?").all(order.id);
    const finalize = db.transaction(() => {
      db.prepare(
        `UPDATE orders
         SET status = 'paid', provider_payment_id = ?, paid_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).run(trackingId || providerOrderId, order.id);

      const insertPurchase = db.prepare(
        `INSERT OR IGNORE INTO purchased_templates (user_id, template_id, amount_inr, payment_id, order_id)
         VALUES (?, ?, ?, ?, ?)`
      );

      for (const item of orderItems) {
        insertPurchase.run(order.user_id, item.template_id, item.amount_inr, trackingId || providerOrderId, providerOrderId);
      }
    });
    finalize();
    return res.redirect(buildFrontendRedirectUrl(frontendUrl, "success", internalOrderId, "Payment successful"));
  }

  db.prepare("UPDATE orders SET status = 'failed' WHERE id = ?").run(order.id);
  return res.redirect(buildFrontendRedirectUrl(frontendUrl, "failed", internalOrderId, `Payment ${orderStatus || "failed"}`));
});

if (NODE_ENV === "production") {
  app.use(express.static(distDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`ResumeForge server running on port ${PORT} (${NODE_ENV})`);
});
