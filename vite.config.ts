import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

const certPath = path.resolve(__dirname, "cert");

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,

    https: {
      key: fs.readFileSync(path.join(certPath, "localhost-key.pem")),
      cert: fs.readFileSync(path.join(certPath, "localhost.pem")),
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
