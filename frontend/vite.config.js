import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTarget = process.env.VITE_API_URL || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  root: ".",
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: ["fdq5dm-5173.csb.app"],
    proxy: {
      "/agent/start": apiTarget,
      "/agent/tool_result": apiTarget,
      "/agent/result": apiTarget,
    },
  },
});
