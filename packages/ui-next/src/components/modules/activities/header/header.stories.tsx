import type { Meta, StoryObj } from "@storybook/react";
import { ActivityHeader } from ".";
import {
  PaperPlaneIcon,
  SparklesIcon,
  Thumbnail,
  ThumbnailCollectible,
  ThumbnailsSubIcon,
} from "@/index";

const meta: Meta<typeof ActivityHeader> = {
  title: "Modules/Activities/Header",
  component: ActivityHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ActivityHeader>;

export const Collectible: Story = {
  render: () => (
    <ActivityHeader
      title="Minted"
      topic="Onyx Bane Ogre"
      subTopic="Beasts"
      Logo={
        <ThumbnailCollectible
          image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
          subIcon={
            <ThumbnailsSubIcon
              Icon={<SparklesIcon variant="solid" />}
              variant="dark"
              size="xl"
            />
          }
          variant="default"
          size="xl"
        />
      }
    />
  ),
};

export const Token: Story = {
  render: () => (
    <ActivityHeader
      title="Sent"
      topic="-0.01 ETH"
      subTopic="-$32.78"
      Logo={
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          subIcon={
            <ThumbnailsSubIcon
              Icon={<PaperPlaneIcon variant="solid" />}
              variant="dark"
              size="xl"
            />
          }
          variant="default"
          size="xl"
          rounded
        />
      }
    />
  ),
};

export const Error: Story = {
  render: () => (
    <ActivityHeader
      title="Sent"
      topic="-0.01 ETH"
      subTopic="-$32.78"
      error
      Logo={
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          subIcon={
            <ThumbnailsSubIcon
              Icon={<PaperPlaneIcon variant="solid" />}
              variant="dark"
              size="xl"
            />
          }
          variant="default"
          size="xl"
          error
          rounded
        />
      }
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <ActivityHeader
      title="Sending"
      topic="-0.01 ETH"
      subTopic="-$32.78"
      loading
      Logo={
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          subIcon={
            <ThumbnailsSubIcon
              Icon={<PaperPlaneIcon variant="solid" />}
              variant="dark"
              size="xl"
            />
          }
          variant="default"
          size="xl"
          loading
          rounded
        />
      }
    />
  ),
};
