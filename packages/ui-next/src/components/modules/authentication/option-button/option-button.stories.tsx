import {
  ArgentColorIcon,
  DiscordIcon,
  MetaMaskColorIcon,
  PasskeyIcon,
  PhantomColorIcon,
  RabbyColorIcon,
} from "@/components/icons";
import type { Meta, StoryObj } from "@storybook/react";
import { OptionButton } from "./option-button";

const meta: Meta<typeof OptionButton> = {
  title: "Modules/Authentication/Option Button",
  component: OptionButton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    icon: <PasskeyIcon />,
    variant: "primary",
  },
};

export default meta;
type Story = StoryObj<typeof OptionButton>;

export const Default: Story = {};

export const MetaMask: Story = {
  args: {
    icon: <MetaMaskColorIcon />,
    variant: "secondary",
  },
};

export const Discord: Story = {
  args: {
    icon: <DiscordIcon />,
    variant: "secondary",
  },
};

export const Rabby: Story = {
  args: {
    icon: <RabbyColorIcon />,
    variant: "secondary",
  },
};

export const Phantom: Story = {
  args: {
    icon: <PhantomColorIcon />,
    variant: "secondary",
  },
};

export const Argent: Story = {
  args: {
    icon: <ArgentColorIcon />,
    variant: "secondary",
  },
};
