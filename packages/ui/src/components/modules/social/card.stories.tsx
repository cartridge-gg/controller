import type { Meta, StoryObj } from "@storybook/react";
import { SocialCard } from "./card";
import { XIcon } from "@/components/icons";
import { ControllerStack } from "@/utils/mock/controller-stack";
import { toast } from "sonner";

const meta = {
  title: "Modules/Social/Card",
  component: SocialCard,
  tags: ["autodocs"],
} satisfies Meta<typeof SocialCard>;

const onClick = () => {
  toast.success("clicked!");
};

export default meta;
type Story = StoryObj<typeof SocialCard>;

export const Default: Story = {
  render: () => (
    <ControllerStack>
      <div className="flex flex-col gap-[1px] w-full">
        <SocialCard text="Connect X" icon={<XIcon />} />
        <SocialCard text="Connect X" icon={<XIcon />} handle="@cartridge_gg" />
        <SocialCard
          text="Connect X"
          icon={<XIcon />}
          handle="@cartridge_gg"
          isExpired={true}
        />
        <SocialCard
          text="Connect X"
          icon={<XIcon />}
          handle="@cartridge_gg"
          onClick={onClick}
          isDisabled={true}
        />
        <SocialCard
          text="Connect X"
          icon={<XIcon />}
          handle="@cartridge_gg"
          onClick={onClick}
          isCompleted={true}
        />
      </div>
      <p className="text-foreground-300">Clickable</p>
      <div className="flex flex-col gap-[1px] w-full">
        <SocialCard text="Connect X" icon={<XIcon />} onClick={onClick} />
        <SocialCard
          text="Connect X"
          icon={<XIcon />}
          onClick={onClick}
          handle="@cartridge_gg"
        />
        <SocialCard
          text="Connect X"
          icon={<XIcon />}
          onClick={onClick}
          handle="@cartridge_gg"
          isExpired={true}
        />
      </div>
    </ControllerStack>
  ),
};

export const NoHandleClickable: Story = {
  args: {
    text: "Connect X",
    icon: <XIcon />,
    onClick,
  },
};

export const WithHandle: Story = {
  args: {
    text: "Connect X",
    icon: <XIcon />,
    handle: "@cartridge_gg",
    onClick: undefined,
  },
};

export const Disabled: Story = {
  args: {
    text: "Connect X",
    icon: <XIcon />,
    handle: "@cartridge_gg",
    onClick,
    isDisabled: true,
  },
};

export const Expired: Story = {
  args: {
    text: "Connect X",
    icon: <XIcon />,
    handle: "@cartridge_gg",
    onClick,
    isExpired: true,
  },
};

export const Completed: Story = {
  args: {
    text: "Connect X",
    icon: <XIcon />,
    handle: "@cartridge_gg",
    onClick,
    isCompleted: true,
  },
};
