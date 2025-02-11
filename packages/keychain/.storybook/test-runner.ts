import { TestRunnerConfig, waitForPageReady } from "@storybook/test-runner";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import path from "path";

const customSnapshotsDir = path.join(process.cwd(), "__image_snapshots__");

// Configure thresholds via environment variables with defaults
const FAILURE_THRESHOLD = parseFloat(
  process.env.STORYBOOK_IMAGE_SNAPSHOT_FAILURE_THRESHOLD ?? "0.01",
);
const DIFF_THRESHOLD = parseFloat(
  process.env.STORYBOOK_IMAGE_SNAPSHOT_DIFF_THRESHOLD ?? "0.1",
);
const FAILURE_THRESHOLD_TYPE = (process.env
  .STORYBOOK_IMAGE_SNAPSHOT_FAILURE_THRESHOLD_TYPE ?? "percent") as
  | "percent"
  | "pixel";

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    // Wait for the page to be ready before taking a screenshot
    await waitForPageReady(page);

    // Wait for any animations to complete
    await page.waitForTimeout(1000);

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
      failureThreshold: FAILURE_THRESHOLD,
      failureThresholdType: FAILURE_THRESHOLD_TYPE,
      customDiffConfig: {
        threshold: DIFF_THRESHOLD,
      },
    });
  },
};

export default config;
