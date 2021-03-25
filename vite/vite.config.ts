const path = require("path");
import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  plugins: [reactRefresh()],
  build: {
    brotliSize: false,
    target: "chrome89",
    polyfillDynamicImport: false,
    // sourcemap: "inline",
  },
});
