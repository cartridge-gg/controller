import { TestRunnerConfig, waitForPageReady } from "@storybook/test-runner";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import path from "path";

const customSnapshotsDir = path.join(process.cwd(), "__image_snapshots__");

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    // Wait for the page to be ready before taking a screenshot
    await waitForPageReady(page);

    // Wait an extra second for transitions to complete
    await page.waitForTimeout(1000);

    // Get the story's container element - selecting the nested content div
    const storyContainer = await page.$("#storybook-root > div > div");
    if (!storyContainer) {
      throw new Error("Could not find story content element");
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
