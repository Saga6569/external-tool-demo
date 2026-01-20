import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTarget = process.env.VITE_API_URL || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  root: ".",
  server: {
    allowedHosts: ["fdq5dm-5173.csb.app"],
    proxy: {
      "/request_tool/": apiTarget,
      "/tool_result/": apiTarget,
    },
  },
});
