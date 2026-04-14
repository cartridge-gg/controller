import type { Meta, StoryObj } from "@storybook/react";
import { CloseButton } from "@/components/primitives/toast/toast";

// Close Button Stories
const closeButtonMeta: Meta<typeof CloseButton> = {
  title: "Primitives/Toast/Supporting/Close Button",
  component: CloseButton,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#353535" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "translucent"],
    },
  },
};

export default closeButtonMeta;

type CloseButtonStory = StoryObj<typeof CloseButton>;

export const DefaultCloseButton: CloseButtonStory = {
  args: {
    variant: "default",
  },
};

export const TranslucentCloseButton: CloseButtonStory = {
  args: {
    variant: "translucent",
  },
};

export const AllCloseButtonVariants: CloseButtonStory = {
  render: () => (
    <div className="flex gap-4 items-center">
      <div className="text-center">
        <CloseButton variant="default" />
        <p className="text-white text-xs mt-1">Default</p>
      </div>
      <div className="text-center bg-[#E66666] p-2 rounded">
        <CloseButton variant="translucent" />
        <p className="text-black text-xs mt-1">Translucent</p>
      </div>
      <div className="text-center">
        <p className="text-gray-400 text-xs mb-2">
          Hover states are applied via CSS
        </p>
        <p className="text-gray-400 text-xs">on actual interaction</p>
      </div>
    </div>
  ),
};
