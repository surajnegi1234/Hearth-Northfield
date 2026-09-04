import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { geminiProxy } from "./vite-plugin-gemini.js";

export default defineConfig(({ mode }) => ({
  base: "/Hearth-Northfield/",
  plugins: [react(), geminiProxy(mode)],
  server: {
    port: 5173,
    open: true,
  },
}));