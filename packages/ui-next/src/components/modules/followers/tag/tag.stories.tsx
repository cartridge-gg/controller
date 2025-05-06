import type { Meta, StoryObj } from "@storybook/react";
import { FollowerTag } from "./tag";

const meta: Meta<typeof FollowerTag> = {
  title: "Modules/Followers/Tag",
  component: FollowerTag,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof FollowerTag>;

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
export const Default: Story = {
  render: (args) => (
    <div className="flex flex-col gap-y-2">
      {variants.map((variant) => (
        <div key={variant} className="grid grid-cols-2 gap-2">
          <p className="text-xs font-medium capitalize">{variant}</p>
          <FollowerTag {...args} variant={variant} />
        </div>
      ))}
    </div>
  ),
};
