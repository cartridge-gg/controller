import type { Meta, StoryObj } from "@storybook/react";
import { Thumbnail } from "./thumbnail";
import { ThumbnailsSubIcon } from "../sub-icon";
import { ArgentIcon, DepositIcon, PaperPlaneIcon } from "@/components/icons";

const meta: Meta<typeof Thumbnail> = {
  title: "Modules/Thumbnails/Thumbnail",
  component: Thumbnail,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Thumbnail>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="sm"
          variant="dark"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="sm"
          variant="faded"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="sm"
          variant="default"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="sm"
          variant="highlight"
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="md"
          variant="dark"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="md"
          variant="faded"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="md"
          variant="default"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="md"
          variant="highlight"
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="lg"
          variant="dark"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="lg"
          variant="faded"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="lg"
          variant="default"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="lg"
          variant="highlight"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
            />
          }
          size="lg"
          variant="faded"
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="xl"
          variant="dark"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="xl"
          variant="faded"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="xl"
          variant="default"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          size="xl"
          variant="highlight"
        />
        <Thumbnail
          icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
              size="lg"
            />
          }
          size="xl"
          variant="faded"
        />
      </div>
    </div>
  ),
};

export const Rounded: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="sm"
          variant="dark"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="sm"
          variant="faded"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="sm"
          variant="default"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="sm"
          variant="highlight"
          rounded
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="md"
          variant="dark"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="md"
          variant="faded"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="md"
          variant="default"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="md"
          variant="highlight"
          rounded
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="lg"
          variant="dark"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="lg"
          variant="faded"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="lg"
          variant="default"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="lg"
          variant="highlight"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
            />
          }
          size="lg"
          variant="faded"
          rounded
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="xl"
          variant="dark"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="xl"
          variant="faded"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="xl"
          variant="default"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="xl"
          variant="highlight"
          rounded
        />
        <Thumbnail
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
              size="lg"
            />
          }
          size="xl"
          variant="faded"
          rounded
        />
      </div>
    </div>
  ),
};

export const Component: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="sm"
          variant="dark"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="sm"
          variant="faded"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="sm"
          variant="default"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="sm"
          variant="highlight"
          centered
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="md"
          variant="dark"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="md"
          variant="faded"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="md"
          variant="default"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="md"
          variant="highlight"
          centered
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="lg"
          variant="dark"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="lg"
          variant="faded"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="lg"
          variant="default"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="lg"
          variant="highlight"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
            />
          }
          size="lg"
          variant="faded"
          centered
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="xl"
          variant="dark"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="xl"
          variant="faded"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="xl"
          variant="default"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          size="xl"
          variant="highlight"
          centered
        />
        <Thumbnail
          icon={<DepositIcon variant="solid" className="w-full h-full" />}
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
              size="lg"
            />
          }
          size="xl"
          variant="faded"
          centered
        />
      </div>
    </div>
  ),
};

export const ComponentRounded: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="sm"
          variant="dark"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="sm"
          variant="faded"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="sm"
          variant="default"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="sm"
          variant="highlight"
          rounded
          centered
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="md"
          variant="dark"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="md"
          variant="faded"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="md"
          variant="default"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="md"
          variant="highlight"
          rounded
          centered
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="lg"
          variant="dark"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="lg"
          variant="faded"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="lg"
          variant="default"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="lg"
          variant="highlight"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
            />
          }
          size="lg"
          variant="faded"
          rounded
          centered
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="xl"
          variant="dark"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="xl"
          variant="faded"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="xl"
          variant="default"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          size="xl"
          variant="highlight"
          rounded
          centered
        />
        <Thumbnail
          icon={<ArgentIcon className="w-full h-full" />}
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
              size="lg"
            />
          }
          size="xl"
          variant="faded"
          rounded
          centered
        />
      </div>
    </div>
  ),
};

export const FontAwesome: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <Thumbnail
          icon="fa-seedling"
          size="sm"
          variant="dark"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          size="sm"
          variant="faded"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          size="sm"
          variant="default"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          size="sm"
          variant="highlight"
          className="text-primary"
          centered
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon="fa-seedling"
          size="md"
          variant="dark"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          size="md"
          variant="faded"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          size="md"
          variant="default"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          size="md"
          variant="highlight"
          className="text-primary"
          centered
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon="fa-seedling"
          size="lg"
          variant="dark"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          size="lg"
          variant="faded"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          size="lg"
          variant="default"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          size="lg"
          variant="highlight"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon
                  className="w-full h-full text-foreground-100"
                  variant="solid"
                />
              }
            />
          }
          size="lg"
          variant="faded"
          className="text-primary"
          centered
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail
          icon="fa-seedling"
          size="xl"
          variant="dark"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          size="xl"
          variant="faded"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          size="xl"
          variant="default"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          size="xl"
          variant="highlight"
          className="text-primary"
          centered
        />
        <Thumbnail
          icon="fa-seedling"
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon
                  className="w-full h-full text-foreground-100"
                  variant="solid"
                />
              }
              size="lg"
            />
          }
          size="xl"
          variant="faded"
          className="text-primary"
          centered
        />
      </div>
    </div>
  ),
};

export const Fallback: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <Thumbnail icon="" size="sm" variant="dark" />
        <Thumbnail icon="" size="sm" variant="faded" />
        <Thumbnail icon="" size="sm" variant="default" />
        <Thumbnail icon="" size="sm" variant="highlight" />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail icon="" size="md" variant="dark" />
        <Thumbnail icon="" size="md" variant="faded" />
        <Thumbnail icon="" size="md" variant="default" />
        <Thumbnail icon="" size="md" variant="highlight" />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail icon="" size="lg" variant="dark" />
        <Thumbnail icon="" size="lg" variant="faded" />
        <Thumbnail icon="" size="lg" variant="default" />
        <Thumbnail icon="" size="lg" variant="highlight" />
        <Thumbnail
          icon=""
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
            />
          }
          size="lg"
          variant="faded"
        />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail icon="" size="xl" variant="dark" />
        <Thumbnail icon="" size="xl" variant="faded" />
        <Thumbnail icon="" size="xl" variant="default" />
        <Thumbnail icon="" size="xl" variant="highlight" />
        <Thumbnail
          icon=""
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
              size="lg"
            />
          }
          size="xl"
          variant="faded"
        />
      </div>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <Thumbnail icon="" size="sm" variant="dark" loading />
        <Thumbnail icon="" size="sm" variant="faded" loading />
        <Thumbnail icon="" size="sm" variant="default" loading />
        <Thumbnail icon="" size="sm" variant="highlight" loading />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail icon="" size="md" variant="dark" loading />
        <Thumbnail icon="" size="md" variant="faded" loading />
        <Thumbnail icon="" size="md" variant="default" loading />
        <Thumbnail icon="" size="md" variant="highlight" loading />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail icon="" size="lg" variant="dark" loading />
        <Thumbnail icon="" size="lg" variant="faded" loading />
        <Thumbnail icon="" size="lg" variant="default" loading />
        <Thumbnail icon="" size="lg" variant="highlight" loading />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail icon="" size="xl" variant="dark" loading />
        <Thumbnail icon="" size="xl" variant="faded" loading />
        <Thumbnail icon="" size="xl" variant="default" loading />
        <Thumbnail icon="" size="xl" variant="highlight" loading />
      </div>
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <Thumbnail icon="" size="sm" variant="dark" error />
        <Thumbnail icon="" size="sm" variant="faded" error />
        <Thumbnail icon="" size="sm" variant="default" error />
        <Thumbnail icon="" size="sm" variant="highlight" error />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail icon="" size="md" variant="dark" error />
        <Thumbnail icon="" size="md" variant="faded" error />
        <Thumbnail icon="" size="md" variant="default" error />
        <Thumbnail icon="" size="md" variant="highlight" error />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail icon="" size="lg" variant="dark" error />
        <Thumbnail icon="" size="lg" variant="faded" error />
        <Thumbnail icon="" size="lg" variant="default" error />
        <Thumbnail icon="" size="lg" variant="highlight" error />
      </div>
      <div className="flex gap-3 ">
        <Thumbnail icon="" size="xl" variant="dark" error />
        <Thumbnail icon="" size="xl" variant="faded" error />
        <Thumbnail icon="" size="xl" variant="default" error />
        <Thumbnail icon="" size="xl" variant="highlight" error />
      </div>
    </div>
  ),
};
