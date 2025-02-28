import { fn, Mock } from "@storybook/test";
import { UpgradeInterface } from "./upgrade";

export * from "./upgrade";

const defaultMockUpgrade: UpgradeInterface = {
  isSynced: true,
  isUpgrading: false,
  available: false,
  current: {
    version: "1.0.0",
    hash: "0x1234567890abcdef",
    outsideExecutionVersion: 1,
    changes: [],
  },
  latest: {
    version: "1.0.0",
    hash: "0x1234567890abcdef",
    outsideExecutionVersion: 1,
    changes: [],
  },
  calls: [],
  onUpgrade: fn(),
  isBeta: false,
};

export function createMockUpgrade(
  // Better way to type this? Failed to implement `DeepPartial<UpgradeInterface>` type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  overrides?: any,
) {
  return {
    ...defaultMockUpgrade,
    ...overrides,
    current: { ...defaultMockUpgrade.current, ...overrides?.current },
    latest: { ...defaultMockUpgrade.latest, ...overrides?.latest },
  };
}

export const useUpgrade: Mock<() => UpgradeInterface> = fn(
  () => defaultMockUpgrade,
);
