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
          size="xs"
          variant="dark"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="xs"
          variant="faded"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="xs"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="xs"
          variant="highlight"
        />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="sm"
          variant="dark"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="sm"
          variant="faded"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="sm"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="sm"
          variant="highlight"
        />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="md"
          variant="dark"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="md"
          variant="faded"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="md"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="md"
          variant="highlight"
        />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="lg"
          variant="dark"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="lg"
          variant="faded"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="lg"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="lg"
          variant="highlight"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
              size="md"
            />
          }
          size="lg"
        />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="xl"
          variant="dark"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="xl"
          variant="faded"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="xl"
        />
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          size="xl"
          variant="highlight"
        />
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
          size="xl"
        />
      </div>
    </div>
  ),
};

export const Fallback: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <ThumbnailCollectible image="" size="xs" variant="dark" />
        <ThumbnailCollectible image="" size="xs" variant="faded" />
        <ThumbnailCollectible image="" size="xs" />
        <ThumbnailCollectible image="" size="xs" variant="highlight" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailCollectible image="" size="sm" variant="dark" />
        <ThumbnailCollectible image="" size="sm" variant="faded" />
        <ThumbnailCollectible image="" size="sm" />
        <ThumbnailCollectible image="" size="sm" variant="highlight" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailCollectible image="" size="md" variant="dark" />
        <ThumbnailCollectible image="" size="md" variant="faded" />
        <ThumbnailCollectible image="" size="md" />
        <ThumbnailCollectible image="" size="md" variant="highlight" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailCollectible image="" size="lg" variant="dark" />
        <ThumbnailCollectible image="" size="lg" variant="faded" />
        <ThumbnailCollectible image="" size="lg" />
        <ThumbnailCollectible image="" size="lg" variant="highlight" />
        <ThumbnailCollectible
          image=""
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
              size="md"
            />
          }
          size="lg"
        />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailCollectible image="" size="xl" variant="dark" />
        <ThumbnailCollectible image="" size="xl" variant="faded" />
        <ThumbnailCollectible image="" size="xl" />
        <ThumbnailCollectible image="" size="xl" variant="highlight" />
        <ThumbnailCollectible
          image=""
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
              size="lg"
            />
          }
          size="xl"
        />
      </div>
    </div>
  ),
};

export const Loading: Story = {
  render: () => <ThumbnailCollectible image="" size="xl" loading />,
};

export const Error: Story = {
  render: () => <ThumbnailCollectible image="" size="xl" error />,
};
