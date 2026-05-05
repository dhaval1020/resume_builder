import fs from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const useHttps = process.env.VITE_HTTPS === "true";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    https: useHttps
      ? {
          cert: fs.readFileSync("./localhost+2.pem"),
          key: fs.readFileSync("./localhost+2-key.pem"),
        }
      : undefined,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
