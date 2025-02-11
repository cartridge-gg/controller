import { Button } from "@/components/primitives/button";
import { useToast } from "@/components/primitives/use-toast";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Toast> = {
  title: "Primitives/Toast",
  component: Toast,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Toast>;

export const Default: Story = {};

function Toast() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: "Scheduled: Catch up",
          description: "Friday, February 10, 2023 at 5:57 PM",
        });
      }}
    >
      Show Toast
    </Button>
  );
}
