import { useState } from "react";
import { UsStateSelect } from "@/components/primitives/us-state-select";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof UsStateSelect> = {
  title: "Primitives/US State Select",
  component: UsStateSelect,
  tags: ["autodocs"],
  argTypes: {
    value: { control: false },
    setValue: { control: false },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    placeholder: "State",
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof UsStateSelect>;

function Controlled({
  placeholder,
  disabled,
  initial = "",
}: {
  placeholder?: string;
  disabled?: boolean;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-[240px]">
      <UsStateSelect
        value={value}
        setValue={setValue}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <Controlled placeholder={args.placeholder} disabled={args.disabled} />
  ),
};

export const Selected: Story = {
  render: (args) => (
    <Controlled
      placeholder={args.placeholder}
      disabled={args.disabled}
      initial="CA"
    />
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Controlled
      placeholder={args.placeholder}
      disabled={args.disabled}
      initial="NY"
    />
  ),
};
