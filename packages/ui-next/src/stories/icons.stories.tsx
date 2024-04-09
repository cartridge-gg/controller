import { CartridgeFaceIcon } from "@/components/icons/brand/cartridge-face";
import { AlertDuoIcon } from "@/components/icons/duotone/alert";
import { Meta, StoryObj } from "@storybook/react";

const iconsByCategory = {
  brand: [CartridgeFaceIcon],
  // "brand-color": [],
  // directional: [],
  duotone: [AlertDuoIcon],
  // state: [],
  // utility: [],
};

const meta: Meta<typeof Icons> = {
  title: "Icons",
  component: Icons,
  tags: ["autodocs"],
  argTypes: {
    category: {
      control: "select",
      options: Object.keys(iconsByCategory),
    },
    boxSize: {
      control: {
        type: "number",
        min: 4,
        max: 10,
      },
    },
    color: {
      control: "color",
      description: "Color icons do not support this prop.",
    },
    variant: {
      control: "select",
      options: ["solid", "line"],
      description: "State icons only.",
    },
    accent: {
      control: "color",
      description: "Duotone icons only.",
    },
    accentHighlight: {
      control: "color",
      description: "Duotone icons only.",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Icons>;

export const Brand: Story = {
  args: {
    category: "brand",
  },
};

function Icons() {
  return (
    <div>
      <CartridgeFaceIcon />
      <AlertDuoIcon />
      <AlertDuoIcon variant="destructive" />
    </div>
  );
}
