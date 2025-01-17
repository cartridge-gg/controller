import { Textarea as UITextarea } from "@/components/primitives/textarea";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Textarea> = {
  title: "Textarea",
  component: Textarea,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

function Textarea() {
  return <UITextarea placeholder="Type your message here." />;
}
