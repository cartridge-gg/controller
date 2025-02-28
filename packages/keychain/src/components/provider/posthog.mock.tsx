import { fn, Mock } from "@storybook/test";
import { PostHogWrapper } from "@cartridge/utils";

export * from "./posthog";

export const usePostHog: Mock<() => PostHogWrapper | undefined> = fn(
  () =>
    ({
      captureException: fn(),
    }) as unknown as PostHogWrapper,
);
