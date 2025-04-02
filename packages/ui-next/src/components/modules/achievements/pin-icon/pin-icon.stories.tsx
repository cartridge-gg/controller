import type { Meta, StoryObj } from "@storybook/react";
import { AchievementPinIcon } from "./pin-icon";

const meta: Meta<typeof AchievementPinIcon> = {
  title: "Modules/Achievements/Pin Icon",
  component: AchievementPinIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    icon: "fa-seedling",
  },
};

export default meta;
type Story = StoryObj<typeof AchievementPinIcon>;

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
      {sizes.map((size) => (
        <div key={size} className="flex gap-3">
          {variants.map((variant) => (
            <AchievementPinIcon
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
      {sizes.map((size) => (
        <div key={size} className="flex gap-3">
          {variants.map((variant) => (
            <AchievementPinIcon
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

export const Empty: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {sizes.map((size) => (
        <div key={size} className="flex gap-3">
          {variants.map((variant) => (
            <AchievementPinIcon
              key={`${variant}-${size}`}
              variant={variant}
              size={size}
              empty
              {...args}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Missing: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {sizes.map((size) => (
        <div key={size} className="flex gap-3">
          {variants.map((variant) => (
            <AchievementPinIcon
              key={`${variant}-${size}`}
              variant={variant}
              size={size}
              icon={undefined}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};
