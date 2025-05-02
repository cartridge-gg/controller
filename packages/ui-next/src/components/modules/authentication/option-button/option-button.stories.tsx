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
    label: "Passkey",
  },
};

export default meta;
type Story = StoryObj<typeof OptionButton>;

export const Default: Story = {};

export const MetaMask: Story = {
  args: {
    icon: <MetaMaskColorIcon />,
    variant: "secondary",
    label: "MetaMask",
  },
};

export const Discord: Story = {
  args: {
    icon: <DiscordIcon />,
    variant: "secondary",
    label: "Discord",
  },
};

export const Rabby: Story = {
  args: {
    icon: <RabbyColorIcon />,
    variant: "secondary",
    label: "Rabby",
  },
};

export const Phantom: Story = {
  args: {
    icon: <PhantomColorIcon />,
    variant: "secondary",
    label: "Phantom",
  },
};

export const Argent: Story = {
  args: {
    icon: <ArgentColorIcon />,
    variant: "secondary",
    label: "Argent",
  },
};
