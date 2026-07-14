import type { Meta, StoryObj } from "@storybook/react";

import { CoinflowKycStatus } from "@/hooks/payments/coinflow-withdraw";
import { CoinflowKycDrawer } from "./CoinflowKycDrawer";

const meta = {
  component: CoinflowKycDrawer,
  decorators: [
    (Story) => (
      <div className="relative w-[432px] h-[560px]">
        <Story />
      </div>
    ),
  ],
  args: {
    isOpen: true,
    onClose: () => {},
    onSubmit: () => {},
    kycStatus: CoinflowKycStatus.None,
    // Read-only summary from the verified identity (useIdentityContext).
    userData: {
      firstName: "Jane",
      lastName: "Doe",
      dob: "1990-04-12",
      email: "jane@example.com",
      phoneNumber: "+15555550123",
    },
  },
} satisfies Meta<typeof CoinflowKycDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** First pass (kycStatus NONE): read-only identity + empty address form. */
export const Default: Story = {};

/** Submitting the address to createCoinflowKYC. */
export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};

/** createCoinflowKYC failed (e.g. FAILED_PRECONDITION "no name/DOB"). */
export const SubmitError: Story = {
  args: {
    error: new Error(
      "Complete your identity verification before registering for withdrawals",
    ),
  },
};

/** Waiting on Coinflow's hosted verification — link button + auto-refresh copy. */
export const PendingWithLink: Story = {
  args: {
    kycStatus: CoinflowKycStatus.Pending,
    verificationLink: "https://sandbox.coinflow.cash/verify/abc123",
  },
};

/** Coinflow is still reviewing — nothing for the user to do. */
export const PendingWithoutLink: Story = {
  args: {
    kycStatus: CoinflowKycStatus.Pending,
  },
};

/** Rejected KYC — contextual banner over the form for a retry. */
export const Rejected: Story = {
  args: {
    kycStatus: CoinflowKycStatus.Rejected,
  },
};

/** Expired KYC — contextual banner over the form for a renewal. */
export const Expired: Story = {
  args: {
    kycStatus: CoinflowKycStatus.Expired,
  },
};

/** Coinflow sandbox active — same standing warning as the other drawers. */
export const Sandbox: Story = {
  args: {
    sandbox: true,
  },
};
