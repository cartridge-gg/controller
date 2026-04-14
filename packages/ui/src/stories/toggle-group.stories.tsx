import {
  ToggleGroup as UIToggleGroup,
  ToggleGroupItem,
} from "@/components/primitives/toggle-group";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof ToggleGroup> = {
  title: "Primitives/Toggle Group",
  component: ToggleGroup,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ToggleGroup>;

export const Default: Story = {};

function ToggleGroup() {
  return (
    <UIToggleGroup type="single">
      <ToggleGroupItem value="a">A</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
      <ToggleGroupItem value="c">C</ToggleGroupItem>
    </UIToggleGroup>
  );
}
