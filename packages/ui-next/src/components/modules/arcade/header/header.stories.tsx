import type { Meta, StoryObj } from "@storybook/react";
import { ArcadeHeader } from "./header";
import { BellIcon, Button, DotsIcon, SpaceInvaderIcon } from "@/index";
import { fn } from "@storybook/test";

const meta: Meta<typeof ArcadeHeader> = {
  title: "Modules/Arcade/Header",
  component: ArcadeHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: {
      values: [{ name: "dark", value: "#363636" }],
      default: "dark",
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof ArcadeHeader>;

const children = (
  <>
    <Button
      className="lowercase font-inter flex gap-1.5 px-3 py-2.5"
      variant="secondary"
      onClick={fn()}
    >
      <SpaceInvaderIcon variant="solid" size="sm" />
      <p className="text-sm">Shinobi</p>
    </Button>
    <Button
      className="lowercase font-inter flex gap-1.5 p-2"
      variant="secondary"
      onClick={fn()}
    >
      <BellIcon variant="solid" size="default" />
      <p className="text-sm bg-background-300 rounded-full px-1.5 py-0.5">3</p>
    </Button>
    <Button variant="icon" size="icon" onClick={fn()}>
      <DotsIcon size="default" />
    </Button>
  </>
);

export const Default: Story = {};

export const DefaultVisitor: Story = {
  args: {
    children: <Button onClick={fn()}>Connect</Button>,
  },
};

export const DefaultUser: Story = {
  args: {
    children,
  },
};

export const Theme: Story = {
  args: {
    cover:
      "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png",
  },
};

export const ThemeVisitor: Story = {
  args: {
    cover:
      "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png",
    children: <Button onClick={fn()}>Connect</Button>,
  },
};

export const ThemeUser: Story = {
  args: {
    cover:
      "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png",
    children,
  },
};
