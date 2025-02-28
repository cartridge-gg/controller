import { fn, Mock } from "@storybook/test";
import { UpgradeInterface } from "./upgrade";

export * from "./upgrade";

export const useUpgrade: Mock<() => UpgradeInterface> = fn(() => ({
  isSynced: true,
  isUpgrading: false,
  available: true,
  current: {
    version: "1.0.0",
    hash: "0x1234567890abcdef",
    outsideExecutionVersion: 1,
    changes: [],
  },
  latest: {
    version: "1.0.1",
    hash: "0x1234567890abcdef",
    outsideExecutionVersion: 1,
    changes: ["Update 1", "Update 2", "Update 3"],
  },
  calls: [],
  onUpgrade: fn(),
  isBeta: false,
}));
