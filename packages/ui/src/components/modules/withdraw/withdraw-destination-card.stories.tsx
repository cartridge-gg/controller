import type { Meta, StoryObj } from "@storybook/react";
import { ControllerContainer } from "@/utils/mock/controller-container";
import { WithdrawDestinationCard } from "./withdraw-destination-card";

const meta = {
  title: "Modules/Withdraw/Card",
  component: WithdrawDestinationCard,
  tags: ["autodocs"],
  args: { kind: "bank-account" },
} satisfies Meta<typeof WithdrawDestinationCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every kind and state — selection highlight plus `fees`/`processingTime` overrides. */
export const All: Story = {
  render: () => (
    <ControllerContainer>
      <WithdrawDestinationCard kind="bank-account" selected />
      <WithdrawDestinationCard kind="card" />
      <WithdrawDestinationCard kind="venmo" />
      <WithdrawDestinationCard kind="paypal" />
      <WithdrawDestinationCard kind="card" fees="$0.25 fee" />
      <WithdrawDestinationCard
        kind="bank-account"
        processingTime="Arrives by Jul 24"
      />
    </ControllerContainer>
  ),
};
