import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const routes = ["auth", "pricing", "ccavenue-checkout"];

await Promise.all(
  routes.map(async (route) => {
    const routeDir = path.join(distDir, route);
    await mkdir(routeDir, { recursive: true });
    await copyFile(path.join(distDir, "index.html"), path.join(routeDir, "index.html"));
  })
);
