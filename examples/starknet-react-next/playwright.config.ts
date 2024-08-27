import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const CI_BASE_URL = process.env.BRANCH_NAME
  ? `https://cartridge-starknet-react-next-git-${process.env.BRANCH_NAME}.preview.cartridge.gg`
  : "https://cartridge-starknet-react-next.preview.cartridge.gg";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL: process.env.CI ? CI_BASE_URL : "http://localhost:3002",
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
