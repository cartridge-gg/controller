import { defineConfig, devices } from "@playwright/test";
import { KEYCHAIN_URL } from "components/providers/StarknetProvider";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL: process.env.CI ? KEYCHAIN_URL : "http://localhost:3002",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],
  // webServer: {
  //   command: "pnpm dev",
  //   cwd: "../..",
  //   port: 3002,
  //   reuseExistingServer: !process.env.CI,
  //   stdout: "pipe",
  //   stderr: "pipe",
  //   timeout: 1000 * 60,
  // },
});
