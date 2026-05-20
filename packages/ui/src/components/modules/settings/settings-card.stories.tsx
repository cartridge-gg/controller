import { DesktopIcon, InfoIcon, UserIcon } from "@cartridge/controller-ui";
import type { Meta, StoryObj } from "@storybook/react";
import { SettingsCard } from "./settings-card";
import { ControllerContainer } from "@/utils/mock/controller-container";
import { toast } from "sonner";

const meta = {
  title: "Modules/Settings/Card",
  component: SettingsCardStory,
  tags: ["autodocs"],
  args: {
    icon: <DesktopIcon variant="solid" size="sm" />,
    label: "example.cartridge.gg",
    rightText: "5d",
    onDelete: async () => {
      toast.success("Deleted");
    },
  },
} satisfies Meta<typeof SettingsCard>;

export default meta;

type Story = StoryObj<typeof SettingsCardStory>;

export const Default: Story = {};

function SettingsCardStory() {
  const handleDelete = async (message: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(message);
  };

  const handleError = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new Error("Something went wrong");
  };

  return (
    <ControllerContainer>
      <SettingsCard
        icon={<DesktopIcon variant="solid" size="sm" />}
        label="With Delete"
        rightText="5d"
        onDelete={async () => {
          await handleDelete("Deleted");
        }}
      />
      <SettingsCard
        icon={<DesktopIcon variant="solid" size="sm" />}
        label="With Delete + Confirm"
        rightText="5d"
        onDelete={async () => {
          await handleDelete("Deleted");
        }}
        confirmDelete
        deleteLabel="Session"
      />
      <SettingsCard
        icon={<UserIcon variant="solid" size="sm" />}
        label="With Unlink"
        rightText="5d"
        onDelete={async () => {
          await handleDelete("Unlinked");
        }}
        unlink
      />

      <SettingsCard
        icon={<UserIcon variant="solid" size="sm" />}
        label="With Unlink + Confirm"
        rightText="5d"
        onDelete={async () => {
          await handleDelete("Unlinked");
        }}
        unlink
        confirmDelete
        deleteLabel="User Data"
        deleteSubTitle="You can always re-link again"
      />

      <SettingsCard
        icon={<InfoIcon size="sm" />}
        label="info only"
        rightText="0d"
      />

      <SettingsCard
        icon={<DesktopIcon variant="solid" size="sm" />}
        label="With Error (custom handler)"
        rightText="5d"
        onDelete={handleError}
      />
      <SettingsCard
        icon={<DesktopIcon variant="solid" size="sm" />}
        label="With Error + Confirm"
        rightText="5d"
        onDelete={handleError}
        confirmDelete
        deleteLabel="Session"
      />
    </ControllerContainer>
  );
}
