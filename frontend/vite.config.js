const react = require("@vitejs/plugin-react");

const apiTarget = process.env.VITE_API_URL || "http://localhost:8000";

module.exports = {
  plugins: [react()],
  root: ".",
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/agent/start": apiTarget,
      "/agent/tool_result": apiTarget,
      "/agent/result": apiTarget,
    },
  },
};
