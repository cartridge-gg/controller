import type { Meta, StoryObj } from "@storybook/react";
import { ThumbnailToken } from "./token";
import { CreditsIcon } from "@/components/icons/utility/credits";
import { ThumbnailsSubIcon } from "../sub-icon";
import { PaperPlaneIcon } from "@/components/icons";

const meta: Meta<typeof ThumbnailToken> = {
  title: "Modules/Thumbnails/Token",
  component: ThumbnailToken,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
  },
};

export default meta;
type Story = StoryObj<typeof ThumbnailToken>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <ThumbnailToken
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="xl"
        />
        <ThumbnailToken
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="lg"
        />
        <ThumbnailToken
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="md"
        />
        <ThumbnailToken
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="sm"
        />
        <ThumbnailToken
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          size="xs"
        />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailToken
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          variant="faded"
          size="xl"
        />
        <ThumbnailToken
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          variant="faded"
          size="lg"
        />
        <ThumbnailToken
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          variant="faded"
          size="md"
        />
        <ThumbnailToken
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          variant="faded"
          size="sm"
        />
        <ThumbnailToken
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          variant="faded"
          size="xs"
        />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailToken
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
        />
        <ThumbnailToken
          icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          subIcon={
            <ThumbnailsSubIcon
              Icon={
                <PaperPlaneIcon className="w-full h-full" variant="solid" />
              }
            />
          }
          size="lg"
        />
      </div>
    </div>
  ),
};

export const SubIcon: Story = {
  args: {
    size: "xl",
    icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
    subIcon: (
      <ThumbnailsSubIcon
        Icon={<PaperPlaneIcon className="w-full h-full" variant="solid" />}
      />
    ),
  },
};

export const ExtraLarge: Story = {
  args: {
    size: "xl",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const ExtraSmall: Story = {
  args: {
    size: "xs",
  },
};

export const FontAwesomeExtraLarge: Story = {
  args: {
    icon: "fa-dollar-sign",
    size: "xl",
  },
};

export const FontAwesomeLarge: Story = {
  args: {
    icon: "fa-dollar-sign",
    size: "lg",
  },
};

export const FontAwesomeMedium: Story = {
  args: {
    icon: "fa-dollar-sign",
    size: "md",
  },
};

export const FontAwesomeSmall: Story = {
  args: {
    icon: "fa-dollar-sign",
    size: "sm",
  },
};

export const FontAwesomeExtraSmall: Story = {
  args: {
    icon: "fa-dollar-sign",
    size: "xs",
  },
};

export const Component: Story = {
  args: {
    icon: <CreditsIcon className="w-full h-full" />,
    size: "xl",
  },
};

export const ComponentLarge: Story = {
  args: {
    icon: <CreditsIcon className="w-full h-full" />,
    size: "lg",
  },
};

export const ComponentMedium: Story = {
  args: {
    icon: <CreditsIcon className="w-full h-full" />,
    size: "md",
  },
};

export const ComponentSmall: Story = {
  args: {
    icon: <CreditsIcon className="w-full h-full" />,
    size: "sm",
  },
};

export const ComponentExtraSmall: Story = {
  args: {
    icon: <CreditsIcon className="w-full h-full" />,
    size: "xs",
  },
};
