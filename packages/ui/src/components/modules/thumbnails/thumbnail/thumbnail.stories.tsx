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
const sizes = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {sizes.map((size) => (
        <div className="flex gap-3">
          {variants.map((variant) => (
            <Thumbnail
              key={`${size}-${variant}`}
              icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
              size={size}
              variant={variant}
            />
          ))}
          {["lg", "xl"].includes(size) && (
            <Thumbnail
              key={`${size}-subicon`}
              icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
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

export const Transdark: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {sizes.map((size) => (
        <div className="flex gap-3">
          {variants.map((variant) => (
            <Thumbnail
              key={`${size}-${variant}`}
              icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
              transdark
              size={size}
              variant={variant}
            />
          ))}
          {["lg", "xl"].includes(size) && (
            <Thumbnail
              key={`${size}-subicon`}
              icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
              transdark
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

export const Translight: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {sizes.map((size) => (
        <div className="flex gap-3">
          {variants.map((variant) => (
            <Thumbnail
              key={`${size}-${variant}`}
              icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
              translight
              size={size}
              variant={variant}
            />
          ))}
          {["lg", "xl"].includes(size) && (
            <Thumbnail
              key={`${size}-subicon`}
              icon="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
              translight
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

export const Rounded: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div className="flex gap-3 ">
          {variants.map((variant) => (
            <Thumbnail
              key={`${size}-${variant}`}
              icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
              size={size}
              variant={variant}
              rounded
            />
          ))}
          {["lg", "xl"].includes(size) && (
            <Thumbnail
              key={`${size}-subicon`}
              icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
              size={size}
              rounded
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

export const Component: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div className="flex gap-3 ">
          {variants.map((variant) => (
            <Thumbnail
              key={`${size}-${variant}`}
              icon={<DepositIcon variant="solid" className="w-full h-full" />}
              size={size}
              variant={variant}
              centered
            />
          ))}
          {["lg", "xl"].includes(size) && (
            <Thumbnail
              key={`${size}-subicon`}
              icon={<DepositIcon variant="solid" className="w-full h-full" />}
              size={size}
              centered
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

export const ComponentRounded: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div className="flex gap-3 ">
          {variants.map((variant) => (
            <Thumbnail
              key={`${size}-${variant}`}
              icon={<ArgentIcon className="w-full h-full" />}
              size={size}
              variant={variant}
              rounded
              centered
            />
          ))}
          {["lg", "xl"].includes(size) && (
            <Thumbnail
              key={`${size}-subicon`}
              icon={<ArgentIcon className="w-full h-full" />}
              size={size}
              rounded
              centered
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

export const FontAwesome: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div className="flex gap-3 ">
          {variants.map((variant) => (
            <Thumbnail
              key={`${size}-${variant}`}
              icon="fa-seedling"
              size={size}
              variant={variant}
              className="text-primary"
              centered
            />
          ))}
          {["lg", "xl"].includes(size) && (
            <Thumbnail
              key={`${size}-subicon`}
              icon="fa-seedling"
              size={size}
              className="text-primary"
              centered
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
        <div className="flex gap-3 ">
          {variants.map((variant) => (
            <Thumbnail
              key={`${size}-${variant}`}
              icon=""
              size={size}
              variant={variant}
            />
          ))}
          {["lg", "xl"].includes(size) && (
            <Thumbnail
              key={`${size}-subicon`}
              icon=""
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
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div className="flex gap-3 ">
          {variants.map((variant) => (
            <Thumbnail
              key={`${size}-${variant}`}
              icon=""
              size={size}
              variant={variant}
              loading
            />
          ))}
          {["lg", "xl"].includes(size) && (
            <Thumbnail
              key={`${size}-subicon`}
              icon=""
              size={size}
              loading
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

export const Error: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      {sizes.map((size) => (
        <div className="flex gap-3 ">
          {variants.map((variant) => (
            <Thumbnail
              key={`${size}-${variant}`}
              icon=""
              size={size}
              variant={variant}
              error
            />
          ))}
          {["lg", "xl"].includes(size) && (
            <Thumbnail
              key={`${size}-subicon`}
              icon=""
              size={size}
              error
              subIcon={
                ["lg", "xl", "xxl"].includes(size) && (
                  <ThumbnailsSubIcon
                    Icon={
                      <PaperPlaneIcon
                        className="w-full h-full"
                        variant="solid"
                      />
                    }
                    size={size as "lg" | "xl"}
                  />
                )
              }
            />
          )}
        </div>
      ))}
    </div>
  ),
};
