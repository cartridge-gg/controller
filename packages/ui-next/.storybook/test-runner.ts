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

    // Enhanced font loading wait
    await page.evaluate(() => document.fonts.ready);

    // Additional delay to ensure fonts are fully rendered
    await page.waitForTimeout(500);

    // Force load common fonts if they exist
    await page.evaluate(() => {
      const fonts = ["Inter", "IBM Plex Mono", "Arial", "Helvetica"]; // Add your common fonts
      fonts.forEach((font) => {
        document.fonts.load(`1em ${font}`);
      });
    });

    // Get the story's container element - selecting the nested content div
    const storyContainer = await page.$("#storybook-root > *");
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
      // Increased threshold to handle font rendering differences
      failureThreshold: 0.1,
      failureThresholdType: "percent",
      // Add blur to reduce impact of anti-aliasing differences
      blur: 3,
      customDiffConfig: {
        threshold: 0.4,
      },
    });
  },
};

export default config;
