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
const sizes = ["lg", "xl"] as const;
const Icons = [
  <PaperPlaneIcon className="w-full h-full" variant="solid" />,
  <JoystickIcon className="w-full h-full" variant="solid" />,
  <ArrowTurnDownIcon className="w-full h-full" />,
  <SparklesIcon className="w-full h-full" variant="solid" />,
  <TrophyIcon className="w-full h-full" variant="solid" />,
] as const;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 ">
      {variants.map((variant) => (
        <div key={`${variant}`} className="grid grid-cols-2 items-center">
          <p className="text-sm font-medium capitalize">{variant}</p>
          <div className="flex flex-col gap-1.5 ">
            {sizes.map((size) => (
              <div key={`${variant}-${size}`} className="flex gap-1.5">
                {Icons.map((Icon, index) => (
                  <ThumbnailsSubIcon
                    key={`${variant}-${size}-${index}`}
                    Icon={Icon}
                    variant={variant}
                    size={size}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
