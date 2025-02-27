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

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="lg"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="md"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="sm"
        />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          variant="faded"
          size="lg"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          variant="faded"
          size="md"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          variant="faded"
          size="sm"
        />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
              size="lg"
            />
          }
          size="lg"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
            />
          }
          size="md"
        />
      </div>
    </div>
  ),
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const NoImage: Story = {
  args: {
    image: "",
  },
};
