const path = require("path");
import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    dedupe: ["react", "react-dom"],
  },
  plugins: [reactRefresh()],
  optimizeDeps: {
    entries: ["index.html", "tabs.html"],
  },
  build: {
    minify: false,
    brotliSize: false,
    target: "chrome89",
    polyfillDynamicImport: false,
    // sourcemap: "inline",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        tabs: path.resolve(__dirname, "tabs.html"),
      },
    },
  },
});
