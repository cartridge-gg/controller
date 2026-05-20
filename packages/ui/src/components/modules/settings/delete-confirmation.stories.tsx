import { DesktopIcon, UserIcon } from "@cartridge/controller-ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DeleteConfirmation } from "./delete-confirmation";
import { Button } from "@/index";
import { ControllerContainer } from "@/utils/mock/controller-container";
import { toast } from "sonner";

const meta = {
  title: "Modules/Settings/DeleteConfirmation",
  component: DeleteConfirmationStory,
  tags: ["autodocs"],
} satisfies Meta<typeof DeleteConfirmationStory>;

export default meta;

type Story = StoryObj<typeof DeleteConfirmationStory>;

export const Default: Story = {};

function DeleteConfirmationStory() {
  const [openDelete, setOpenDelete] = useState(false);
  const [openUnlink, setOpenUnlink] = useState(false);

  const handleConfirm = async (message: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(message);
  };

  return (
    <ControllerContainer>
      <Button onClick={() => setOpenDelete(true)}>Open Delete</Button>
      <Button onClick={() => setOpenUnlink(true)}>Open Unlink</Button>

      <DeleteConfirmation
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={() => handleConfirm("Deleted")}
        icon={<DesktopIcon variant="solid" size="sm" />}
        label="Session"
      />
      <DeleteConfirmation
        isOpen={openUnlink}
        onClose={() => setOpenUnlink(false)}
        onConfirm={() => handleConfirm("Unlinked")}
        icon={<UserIcon variant="solid" size="sm" />}
        label="User Data"
        subTitle="You can always re-link again"
        unlink
      />
    </ControllerContainer>
  );
}
