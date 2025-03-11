import type { Meta, StoryObj } from "@storybook/react";
import { ThumbnailsSubIcon } from "./sub-icon";
import {
  ArrowTurnDownIcon,
  JoystickIcon,
  PaperPlaneIcon,
  SparklesIcon,
  TrophyIcon,
} from "@/components/icons";

const meta: Meta<typeof ThumbnailsSubIcon> = {
  title: "Modules/Thumbnails/Sub Icon",
  component: ThumbnailsSubIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    Icon: <SparklesIcon className="w-full h-full" variant="solid" />,
  },
};

export default meta;
type Story = StoryObj<typeof ThumbnailsSubIcon>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 ">
      <div className="flex gap-1.5 ">
        <ThumbnailsSubIcon
          Icon={<PaperPlaneIcon className="w-full h-full" variant="solid" />}
        />
        <ThumbnailsSubIcon
          Icon={<JoystickIcon className="w-full h-full" variant="solid" />}
        />
        <ThumbnailsSubIcon
          Icon={<ArrowTurnDownIcon className="w-full h-full" />}
        />
        <ThumbnailsSubIcon
          Icon={<SparklesIcon className="w-full h-full" variant="solid" />}
        />
        <ThumbnailsSubIcon
          Icon={<TrophyIcon className="w-full h-full" variant="solid" />}
        />
      </div>
      <div className="flex gap-1.5 ">
        <ThumbnailsSubIcon
          Icon={<PaperPlaneIcon className="w-full h-full" variant="solid" />}
          variant="faded"
          size="lg"
        />
        <ThumbnailsSubIcon
          Icon={<JoystickIcon className="w-full h-full" variant="solid" />}
          variant="faded"
          size="lg"
        />
        <ThumbnailsSubIcon
          Icon={<ArrowTurnDownIcon className="w-full h-full" />}
          variant="faded"
          size="lg"
        />
        <ThumbnailsSubIcon
          Icon={<SparklesIcon className="w-full h-full" variant="solid" />}
          variant="faded"
          size="lg"
        />
        <ThumbnailsSubIcon
          Icon={<TrophyIcon className="w-full h-full" variant="solid" />}
          variant="faded"
          size="lg"
        />
      </div>
    </div>
  ),
};

export const Faded: Story = {
  args: {
    variant: "faded",
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
