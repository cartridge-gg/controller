import type { Meta, StoryObj } from "@storybook/react";
import { ArcadeGameSelect } from "./game-select";
import { fn } from "@storybook/test";

const meta: Meta<typeof ArcadeGameSelect> = {
  title: "Modules/Arcade/Game Select",
  component: ArcadeGameSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    name: "Loot Survivor",
    logo: "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png",
    cover:
      "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png",
    points: 400,
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArcadeGameSelect>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const Unplayed: Story = {
  args: {
    points: 0,
  },
};

export const UnplayedActive: Story = {
  args: {
    points: 0,
    active: true,
  },
};

export const Unthemed: Story = {
  args: {
    cover: undefined,
  },
};

export const UnthemedActive: Story = {
  args: {
    cover: undefined,
    active: true,
  },
};

export const Unknown: Story = {
  args: {
    name: "Game Name",
    logo: undefined,
    cover: undefined,
  },
};

export const UnknownActive: Story = {
  args: {
    name: "Game Name",
    logo: undefined,
    cover: undefined,
    active: true,
  },
};
