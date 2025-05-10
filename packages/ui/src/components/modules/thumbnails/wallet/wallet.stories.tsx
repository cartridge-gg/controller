import type { Meta, StoryObj } from "@storybook/react";
import { ThumbnailWallet } from "./wallet";

const meta: Meta<typeof ThumbnailWallet> = {
  title: "Modules/Thumbnails/Wallet",
  component: ThumbnailWallet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ThumbnailWallet>;

const variants = [
  "darkest",
  "darker",
  "dark",
  "default",
  "light",
  "lighter",
  "lightest",
] as const;
const sizes = ["sm", "md", "lg", "xl"] as const;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div key={size} className="flex gap-3 ">
          {variants.map((variant) => (
            <ThumbnailWallet
              key={`${size}-${variant}`}
              variant={variant}
              size={size}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const ArgentX: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div key={size} className="flex gap-3 ">
          {variants.map((variant) => (
            <ThumbnailWallet
              key={`${size}-${variant}`}
              variant={variant}
              size={size}
              brand="argentx"
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Braavos: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div key={size} className="flex gap-3 ">
          {variants.map((variant) => (
            <ThumbnailWallet
              key={`${size}-${variant}`}
              variant={variant}
              size={size}
              brand="braavos"
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const OpenZeppelin: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div key={size} className="flex gap-3 ">
          {variants.map((variant) => (
            <ThumbnailWallet
              key={`${size}-${variant}`}
              variant={variant}
              size={size}
              brand="openzeppelin"
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Controller: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div key={size} className="flex gap-3 ">
          {variants.map((variant) => (
            <ThumbnailWallet
              key={`${size}-${variant}`}
              variant={variant}
              size={size}
              brand="controller"
            />
          ))}
        </div>
      ))}
    </div>
  ),
};
