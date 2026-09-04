import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { geminiProxy } from "./vite-plugin-gemini.js";

function githubPagesSpaFallback() {
  return {
    name: "github-pages-spa-fallback",
    closeBundle() {
      const index = resolve("dist/index.html");
      const fallback = resolve("dist/404.html");
      if (existsSync(index)) copyFileSync(index, fallback);
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: "/Hearth-Northfield/",
  plugins: [react(), geminiProxy(mode), githubPagesSpaFallback()],
  server: {
    port: 5173,
    open: true,
  },
}));