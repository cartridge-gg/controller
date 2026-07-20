import type { Meta, StoryObj } from "@storybook/react";

import { BankAuthDrawer } from "./BankAuthDrawer";
import { WithdrawContext, type WithdrawContextValue } from "./provider";

// BankAuthDrawer is a thin view over the provider-owned bank-auth session, so
// stories inject the `bankAuth` slice via the context. Only the deterministic
// pre-iframe states are storied here — a "ready" story would mount Coinflow's
// live hosted iframe (external), which is not snapshot-safe.
const withBankAuth = (bankAuth: WithdrawContextValue["bankAuth"]) =>
  function Decorator(Story: () => React.ReactElement) {
    return (
      <WithdrawContext.Provider
        value={{ bankAuth } as unknown as WithdrawContextValue}
      >
        <div className="relative w-[432px] h-[720px]">
          <Story />
        </div>
      </WithdrawContext.Provider>
    );
  };

const meta = {
  component: BankAuthDrawer,
  args: {
    isOpen: true,
    onClose: () => {},
  },
} satisfies Meta<typeof BankAuthDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Minting the hosted-UI session — loader until Coinflow returns the key. */
export const Loading: Story = {
  decorators: [
    withBankAuth({
      session: undefined,
      isMinting: true,
      error: null,
      onLinked: () => {},
    }),
  ],
};

/** createCoinflowBankAuthSession failed — friendly error alert. */
export const ErrorState: Story = {
  decorators: [
    withBankAuth({
      session: undefined,
      isMinting: false,
      error: new Error("Unable to reach Coinflow. Please try again."),
      onLinked: () => {},
    }),
  ],
};

/** Coinflow sandbox active — the standing warning shows above the loader. */
export const Sandbox: Story = {
  args: {
    sandbox: true,
  },
  decorators: [
    withBankAuth({
      session: undefined,
      isMinting: true,
      error: null,
      onLinked: () => {},
    }),
  ],
};
