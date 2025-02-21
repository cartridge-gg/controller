import type { Meta, StoryObj } from "@storybook/react";
import { ArcadeGameIcon } from "./game-icon";

const meta: Meta<typeof ArcadeGameIcon> = {
  title: "Modules/Arcade/Game Icon",
  component: ArcadeGameIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    logo: "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png",
    name: "Loot Survivor",
    variant: "default",
    size: "default",
  },
};

export default meta;
type Story = StoryObj<typeof ArcadeGameIcon>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const Faded: Story = {
  args: {
    variant: "faded",
  },
};

export const MissingLogo: Story = {
  args: {
    logo: undefined,
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const ExtraLarge: Story = {
  args: {
    size: "xl",
  },
};
