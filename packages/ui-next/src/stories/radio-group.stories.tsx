import { Label } from "@/components/primitives/label";
import {
  RadioGroup as UIRadioGroup,
  RadioGroupItem,
} from "@/components/primitives/radio-group";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof RadioGroup> = {
  title: "Primitives/Radio Group",
  component: RadioGroup,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {};

function RadioGroup() {
  return (
    <UIRadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option One</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Two</Label>
      </div>
    </UIRadioGroup>
  );
}
