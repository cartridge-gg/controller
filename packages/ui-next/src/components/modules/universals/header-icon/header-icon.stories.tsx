import type { Meta, StoryObj } from "@storybook/react";
import { UniversalHeaderIcon } from "./header-icon";
import { DepositIcon, EthereumColorIcon } from "@/components/icons";

const meta: Meta<typeof UniversalHeaderIcon> = {
  title: "Modules/Universals/Header Icon",
  component: UniversalHeaderIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    variant: "default",
    size: "default",
  },
};

export default meta;
type Story = StoryObj<typeof UniversalHeaderIcon>;

export const Default: Story = {};

export const IconComponent: Story = {
  args: {
    icon: <DepositIcon variant="solid" size="lg" />,
  },
};

export const IconUrl: Story = {
  args: {
    icon: "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/dominion/icon.svg",
  },
};

export const IconString: Story = {
  args: {
    icon: "fa-helmet-battle",
  },
};

export const IconRounded: Story = {
  args: {
    icon: <EthereumColorIcon className="h-9 w-9" />,
    className: "rounded-full",
  },
};
