import type { Meta, StoryObj } from "@storybook/react";

import { CreateBankAccountDrawer } from "./CreateBankAccountDrawer";

const meta = {
  component: CreateBankAccountDrawer,
  decorators: [
    (Story) => (
      <div className="relative w-[432px] h-[720px]">
        <Story />
      </div>
    ),
  ],
  args: {
    isOpen: true,
    onClose: () => {},
    onSubmit: () => {},
  },
} satisfies Meta<typeof CreateBankAccountDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Empty form — Continue disabled until every required field validates. */
export const Default: Story = {};

/** FAILED_PRECONDITION "address required" — the address fields reveal for a
 * resubmit instead of a hard error. */
export const AddressRequired: Story = {
  args: {
    error: new Error("address required"),
  },
};

/** Any other createCoinflowBankAccount failure — error alert. */
export const ErrorState: Story = {
  args: {
    error: new Error("Failed to link bank account"),
  },
};

/** Coinflow sandbox active — same standing warning as the other drawers. */
export const Sandbox: Story = {
  args: {
    sandbox: true,
  },
};
