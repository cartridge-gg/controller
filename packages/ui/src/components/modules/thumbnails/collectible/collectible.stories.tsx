import type { Meta, StoryObj } from "@storybook/react";
import { ThumbnailCollectible } from "./collectible";
import { PaperPlaneIcon } from "@/components/icons";
import { ThumbnailsSubIcon } from "../sub-icon";

const meta: Meta<typeof ThumbnailCollectible> = {
  title: "Modules/Thumbnails/Collectible",
  component: ThumbnailCollectible,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    image:
      "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png",
  },
};

export default meta;
type Story = StoryObj<typeof ThumbnailCollectible>;

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
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div key={size} className="flex gap-3 ">
          {variants.map((variant) => (
            <ThumbnailCollectible
              key={`${size}-${variant}`}
              image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
              size={size}
              variant={variant}
            />
          ))}
          {["lg", "xl"].includes(size) && (
            <ThumbnailCollectible
              key={`${size}-subicon`}
              image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
              size={size}
              subIcon={
                <ThumbnailsSubIcon
                  Icon={
                    <PaperPlaneIcon className="w-full h-full" variant="solid" />
                  }
                  size={size as "lg" | "xl"}
                />
              }
            />
          )}
        </div>
      ))}
    </div>
  ),
};

export const Fallback: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div key={size} className="flex gap-3 ">
          {variants.map((variant) => (
            <ThumbnailCollectible
              key={`${size}-${variant}`}
              image=""
              size={size}
              variant={variant}
            />
          ))}
          {["lg", "xl"].includes(size) && (
            <ThumbnailCollectible
              key={`${size}-subicon`}
              image=""
              size={size}
              subIcon={
                <ThumbnailsSubIcon
                  Icon={
                    <PaperPlaneIcon className="w-full h-full" variant="solid" />
                  }
                  size={size as "lg" | "xl"}
                />
              }
            />
          )}
        </div>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  render: () => <ThumbnailCollectible image="" size="xl" loading />,
};

export const Error: Story = {
  render: () => <ThumbnailCollectible image="" size="xl" error />,
};
