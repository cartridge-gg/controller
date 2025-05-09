import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleProperties } from "./properties";

const meta: Meta<typeof CollectibleProperties> = {
  title: "Modules/Collectibles/Properties",
  component: CollectibleProperties,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    properties: [
      { name: "Name", value: "Bibliomancer" },
      { name: "XP", value: "0" },
      { name: "Level", value: 1 },
      { name: "Health", value: 90 },
      { name: "Gold", value: 25 },
      { name: "Strength", value: null },
      { name: "Dexterity", value: null },
      { name: "Intelligence", value: null },
      { name: "Vitality", value: null },
      { name: "Wisdom", value: null },
      { name: "Charisma", value: null },
      { name: "Luck", value: null },
      { name: "Hours Left", value: "Bibliomancer" },
      { name: "weapon", value: "Bibliomancer" },
      { name: "Chest armor", value: undefined },
      { name: "Hand_armor", value: undefined },
      { name: "waist armor", value: undefined },
      { name: "Foot armor", value: undefined },
      { name: "head Armor", value: undefined },
      { name: "Necklace", value: undefined },
      { name: "Ring", value: undefined },
      { name: "Current rank", value: "0" },
      { name: "Rank at_death", value: 0 },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleProperties>;

export const Default: Story = {};

export const One: Story = {
  args: {
    properties: [{ name: "Name", value: "Bibliomancer" }],
  },
};

export const Two: Story = {
  args: {
    properties: [
      { name: "Name", value: "Bibliomancer" },
      { name: "XP", value: "0" },
    ],
  },
};

export const Three: Story = {
  args: {
    properties: [
      { name: "Name", value: "Bibliomancer" },
      { name: "XP", value: "0" },
      { name: "Level", value: 1 },
    ],
  },
};
