import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const CCAVENUE_CHECKOUT_STORAGE_KEY = "ccavenue_checkout_payload";

type CheckoutPayload = {
  paymentUrl: string;
  encRequest: string;
  accessCode: string;
};

const buildIframeUrl = (payload: CheckoutPayload): string => {
  const url = new URL(payload.paymentUrl);
  if (!url.searchParams.has("command")) {
    url.searchParams.set("command", "initiateTransaction");
  }
  url.searchParams.set("encRequest", payload.encRequest);
  url.searchParams.set("access_code", payload.accessCode);
  return url.toString();
};

const CcavenueCheckout = () => {
  const navigate = useNavigate();
  const [payload, setPayload] = useState<CheckoutPayload | null>(null);
  const [frameHeight, setFrameHeight] = useState(700);

  useEffect(() => {
    const raw = sessionStorage.getItem(CCAVENUE_CHECKOUT_STORAGE_KEY);
    if (!raw) {
      toast.error("Checkout session expired. Please try again.");
      navigate("/pricing", { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as CheckoutPayload;
      if (!parsed.paymentUrl || !parsed.encRequest || !parsed.accessCode) {
        throw new Error("Invalid checkout payload");
      }
      setPayload(parsed);
    } catch {
      toast.error("Invalid checkout session. Please try again.");
      navigate("/pricing", { replace: true });
      return;
    } finally {
      sessionStorage.removeItem(CCAVENUE_CHECKOUT_STORAGE_KEY);
    }
  }, [navigate]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const nextHeight = Number((event.data as { newHeight?: number })?.newHeight);
      if (Number.isFinite(nextHeight) && nextHeight >= 500 && nextHeight <= 2000) {
        setFrameHeight(nextHeight);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const iframeSrc = useMemo(() => (payload ? buildIframeUrl(payload) : ""), [payload]);

  if (!payload) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Secure Checkout
          </h1>
          <Link to="/pricing">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pricing
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Card className="p-4">
          <iframe
            title="CCAvenue Payment"
            src={iframeSrc}
            className="w-full border-0 rounded-md"
            style={{ minHeight: 500, height: frameHeight }}
          />
        </Card>
      </div>
    </div>
  );
};

export default CcavenueCheckout;
