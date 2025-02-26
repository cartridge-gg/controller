import type { Meta, StoryObj } from "@storybook/react";
import { UniversalHeaderLabel } from "./header-label";
import { DepositIcon } from "@/components/icons";

const meta: Meta<typeof UniversalHeaderLabel> = {
  title: "Modules/Universals/Header Label",
  component: UniversalHeaderLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    variant: "default",
    size: "default",
    label: "Deposit [Token]",
    icon: <DepositIcon variant="solid" size="lg" />,
  },
};

export default meta;
type Story = StoryObj<typeof UniversalHeaderLabel>;

export const Default: Story = {};
