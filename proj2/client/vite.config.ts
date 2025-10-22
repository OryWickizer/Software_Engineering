import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const separate = process.env.SEPARATE_DEV === "true";

  return {
    root: ".", // current directory (client)
    server: {
      host: "::",
      port: separate ? 5173 : 8080,
      proxy: separate
        ? {
            "/api": {
              target: "http://localhost:3001", // backend server
              changeOrigin: true,
            },
          }
        : undefined,
      fs: {
        allow: [".."],
        deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
      },
    },
    build: {
      outDir: "dist/spa",
    },
    plugins: [react(), ...(separate ? [] : [expressPlugin()])],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."), // ✅ points directly to client/
        "@components": path.resolve(__dirname, "./components"),
        "@pages": path.resolve(__dirname, "./pages"),
        "@hooks": path.resolve(__dirname, "./hooks"),
        "@assets": path.resolve(__dirname, "./assets"),
      },
    },
  };
});


