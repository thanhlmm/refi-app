import { defineConfig } from "@playwright/test";

export default defineConfig({
  testMatch: "smoke.test.ts",
  workers: 1,
  timeout: 120_000,
});
