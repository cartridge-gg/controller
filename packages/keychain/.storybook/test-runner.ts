import { TestRunnerConfig } from "@storybook/test-runner";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import path from "path";

const customSnapshotsDir = path.join(process.cwd(), "__image_snapshots__");

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    // Wait for the page to be ready before taking a screenshot
    await page.waitForSelector("#storybook-root", {
      state: "visible",
      timeout: 45000,
    });

    // Get the story's container element - selecting the nested content div
    const storyContainer = await page.$("#storybook-root > div > div");
    if (!storyContainer) {
      console.warn("Could not find story content element");
      return;
    }

    // Get browser name to handle different browsers if needed
    const browserName =
      page.context().browser()?.browserType().name() ?? "unknown";

    // Take screenshot of just the story container
    const image = await storyContainer.screenshot();
    expect(image).toMatchImageSnapshot({
      customSnapshotsDir,
      customSnapshotIdentifier: `${context.id}-${browserName}`,
      // Add some threshold to handle minor rendering differences
      failureThreshold: 0.01,
      failureThresholdType: "percent",
    });
  },
};

export default config;
