import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

const nextStub = resolve(__dirname, "src/stubs/next-navigation.ts");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // nextstepjs bundles Next.js / React Router adapters as optional peers;
      // stub them out so Vite doesn't error when they're absent.
      "next/navigation": nextStub,
      "next/router": nextStub,
    },
  },
});
