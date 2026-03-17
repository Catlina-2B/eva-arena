import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://eva-backend-production-e089.up.railway.app",
        changeOrigin: true,
      },
      "/_img": {
        target: "https://eva-agent.s3.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_img/, ""),
      },
    },
  },
});
