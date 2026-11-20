import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// vite-plugin-singlefile is removed: it inlines all product PNGs as base64 into the HTML,
// causing V8 heap exhaustion during bundling. Cloudflare Workers Pages assets mode handles
// multi-file deployment natively via the wrangler.jsonc "assets" block.

import { cloudflare } from "@cloudflare/vite-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()], // add cloudflare() only for production build if needed
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
});