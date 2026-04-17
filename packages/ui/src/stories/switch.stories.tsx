import { Switch as UISwitch } from "@/components/primitives/switch";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Switch> = {
  title: "Primitives/Switch",
  component: Switch,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

function Switch() {
  return <UISwitch />;
}
