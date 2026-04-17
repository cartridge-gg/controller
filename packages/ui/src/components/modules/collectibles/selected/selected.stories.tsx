import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleSelected, CollectibleSelectedProps } from "./selected";
import { CheckboxIcon } from "@/index";

const meta: Meta<typeof CollectibleSelected> = {
  title: "Modules/Collectibles/Selected",
  component: CollectibleSelected,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    size: "sm",
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleSelected>;

export const Default: Story = {
  render: function Render(args: CollectibleSelectedProps) {
    const [selected, setSelected] = useState(false);
    return (
      <div className="flex gap-2">
        <CollectibleSelected
          {...args}
          size="xl"
          selected={selected}
          onSelect={() => setSelected(!selected)}
        />
      </div>
    );
  },
};

export const NormalSize: Story = {
  render: function Render(args: CollectibleSelectedProps) {
    const [selected, setSelected] = useState(false);
    return (
      <div className="flex gap-2">
        <CollectibleSelected
          {...args}
          size="sm"
          selected={selected}
          onSelect={() => setSelected(!selected)}
        />
      </div>
    );
  },
};

export const Faded: Story = {
  render: function Render(args: CollectibleSelectedProps) {
    const [selected, setSelected] = useState(false);
    return (
      <div className="flex gap-2">
        <CollectibleSelected
          {...args}
          size="sm"
          selected={selected}
          onSelect={() => setSelected(!selected)}
          variant="faded"
        />
      </div>
    );
  },
};

const variants = [
  "solid",
  "line",
  "minus-solid",
  "minus-line",
  "plus-solid",
  "plus-line",
  "unchecked-solid",
  "unchecked-line",
  "check",
] as const;

export const CheckboxIconVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4">
        xs:
        {variants.map((variant) => (
          <CheckboxIcon key={variant} variant={variant} size="xs" />
        ))}
      </div>
      <div className="flex justify-center items-end gap-4">
        sm:
        {variants.map((variant) => (
          <CheckboxIcon key={variant} variant={variant} size="sm" />
        ))}
      </div>
      <div className="flex justify-center items-end gap-4">
        lg:
        {variants.map((variant) => (
          <CheckboxIcon key={variant} variant={variant} size="lg" />
        ))}
      </div>
      <div className="flex justify-center items-end gap-4">
        xl:
        {variants.map((variant) => (
          <CheckboxIcon key={variant} variant={variant} size="xl" />
        ))}
      </div>
    </div>
  ),
};
