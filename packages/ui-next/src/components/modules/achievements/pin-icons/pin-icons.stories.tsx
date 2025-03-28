import type { Meta, StoryObj } from "@storybook/react";
import { AchievementPinIcons } from "./pin-icons";

const meta: Meta<typeof AchievementPinIcons> = {
  title: "Modules/Achievements/Pin Icons",
  component: AchievementPinIcons,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    pins: [
      {
        id: "1",
        icon: "fa-seedling",
      },
      {
        id: "2",
        icon: "fa-swords",
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof AchievementPinIcons>;

const variants = [
  "darkest",
  "darker",
  "dark",
  "default",
  "light",
  "lighter",
  "lightest",
  "ghost",
] as const;
const sizes = ["xs", "default", "md"] as const;

export const Default: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {variants.map((variant) => (
        <div key={variant} className="grid grid-cols-4 items-center">
          <p className="text-sm text-foreground-100 capitalize text-medium">
            {variant}
          </p>
          {sizes.map((size) => (
            <AchievementPinIcons
              key={`${variant}-${size}`}
              variant={variant}
              size={size}
              {...args}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Theme: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {variants.map((variant) => (
        <div key={variant} className="grid grid-cols-4 items-center">
          <p className="text-sm text-foreground-100 capitalize text-medium">
            {variant}
          </p>
          {sizes.map((size) => (
            <AchievementPinIcons
              key={`${variant}-${size}`}
              variant={variant}
              size={size}
              theme
              {...args}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Color: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {variants.map((variant) => (
        <div key={variant} className="grid grid-cols-4 items-center">
          <p className="text-sm text-foreground-100 capitalize text-medium">
            {variant}
          </p>
          {sizes.map((size) => (
            <AchievementPinIcons
              key={`${variant}-${size}`}
              variant={variant}
              size={size}
              color="#ff00ff"
              {...args}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};
