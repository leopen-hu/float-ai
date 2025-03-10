import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        background: resolve(__dirname, "src/background.ts"),
        contentScript: resolve(__dirname, "src/contentScript.ts"),
      },
      output: {
        entryFileNames: (chunk) => {
          return chunk.name === "main"
            ? "assets/[name]-[hash].js"
            : "[name].js";
        },
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "markdown-vendor": [
            "react-markdown",
            "remark-gfm",
            "rehype-raw",
            "rehype-katex",
            "remark-math",
          ],
          "i18n-vendor": ["i18next", "react-i18next"],
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
});
