import {
  Popover as UIPopover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/primitives/popover";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Popover> = {
  title: "Primitives/Popover",
  component: Popover,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {};

function Popover() {
  return (
    <UIPopover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>Place content for the popover here.</PopoverContent>
    </UIPopover>
  );
}
