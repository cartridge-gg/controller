import type { Meta, StoryObj } from "@storybook/react";
import { RegisteredAccountCard } from "./registered-account-card";

const meta = {
  title: "components/settings/Registered Account Card",
  component: RegisteredAccountCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    accountName: "Clicksave.stark",
    accountAddress: "0x04183183013819381932139812918",
  },
} satisfies Meta<typeof RegisteredAccountCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
