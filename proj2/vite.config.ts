import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const separate = process.env.SEPARATE_DEV === "true";
  return {
    server: {
      host: "::",
      port: separate ? 5173 : 8080,
      proxy: separate
        ? {
            "/api": {
              target: "http://localhost:3001",
              changeOrigin: true,
            },
          }
        : undefined,
      fs: {
  allow: [".."], // Allow parent directory (everything in the project)
  deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
},
    },
    build: {
      outDir: "dist/spa",
    },
    plugins: [react(), ...(separate ? [] : [expressPlugin()])],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
  };
});

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
