import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      type Next = (err?: any) => void;
      const expressAsConnect = app as unknown as (
        req: IncomingMessage,
        res: ServerResponse,
        next: Next
      ) => void;

      // Add Express app as middleware to Vite dev server
      // Mount Express only for /api requests to avoid intercepting Vite assets and SPA routes
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith("/api")) {
          return expressAsConnect(req, res, next);
        }
        next();
      });
    },
  };
}
