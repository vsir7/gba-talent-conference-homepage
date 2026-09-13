import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist/client",
    rollupOptions: {
      input: {
        conference: resolve(import.meta.dirname, "index.html"),
        schedule: resolve(import.meta.dirname, "schedule.html"),
        news: resolve(import.meta.dirname, "news.html"),
        newsDetail: resolve(import.meta.dirname, "news-detail.html"),
        service: resolve(import.meta.dirname, "service.html"),
        ticket: resolve(import.meta.dirname, "ticket.html"),
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
