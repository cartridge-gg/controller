import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT) || 4100;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `PORT=${PORT} pnpm dev`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
