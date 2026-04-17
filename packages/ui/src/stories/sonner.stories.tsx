import { Button } from "@/components/primitives/button";
import { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";

const meta: Meta<typeof Sonner> = {
  title: "Primitives/Sonner",
  component: Sonner,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Sonner>;

export const Default: Story = {};

function Sonner() {
  return (
    <Button onClick={() => toast("Event has been created.")}>Toast</Button>
  );
}
