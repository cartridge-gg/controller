import { Input as UIInput } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Label> = {
  title: "Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {};

function Label() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <UILabel htmlFor="email">Email</UILabel>
      <UIInput type="email" id="email" placeholder="Email" />
    </div>
  );
}
