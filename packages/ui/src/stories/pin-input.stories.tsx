import { PinInput as UIPinInput } from "@/components/primitives/pin-input";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta: Meta<typeof UIPinInput> = {
  title: "Primitives/Pin Input",
  component: UIPinInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof UIPinInput>;

function PinInput({
  length,
  type,
  lettercase,
  variant,
}: {
  length?: number;
  type?: "numeric" | "alphanumeric";
  lettercase?: "uppercase" | "lowercase";
  variant?: "default" | "destructive";
}) {
  const [value, setValue] = useState("");
  return (
    <UIPinInput
      value={value}
      onChange={setValue}
      length={length}
      type={type}
      lettercase={lettercase}
      variant={variant}
    />
  );
}

export const Numeric: Story = {
  render: () => <PinInput length={6} type="numeric" />,
};

export const Alphanumeric: Story = {
  render: () => <PinInput length={9} type="alphanumeric" />,
};

export const AlphanumericUppercase: Story = {
  render: () => (
    <PinInput length={9} type="alphanumeric" lettercase="uppercase" />
  ),
};

export const AlphanumericLowercase: Story = {
  render: () => (
    <PinInput length={9} type="alphanumeric" lettercase="lowercase" />
  ),
};

export const Destructive: Story = {
  render: () => <PinInput length={6} type="numeric" variant="destructive" />,
};
