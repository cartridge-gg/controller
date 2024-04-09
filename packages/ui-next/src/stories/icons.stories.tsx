import { CartridgeFaceIcon } from "@/components/icons/brand/cartridge-face";
import { AlertDuoIcon } from "@/components/icons/duotone/alert";
import { IconProps } from "@/components/icons/types";
import { size } from "@/components/icons/utils";
import { Meta, StoryObj } from "@storybook/react";

const iconsByCategory = {
  brand: [CartridgeFaceIcon],
  brandColor: [],
  directional: [],
  duotone: [AlertDuoIcon],
  state: [],
  utility: [],
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
    size: {
      control: {
        type: "select",
        options: Object.keys(size),
      },
    },
    // variant: {
    //   control: "select",
    //   options: ["solid", "line"],
    //   description: "State icons only.",
    // },
    // accent: {
    //   control: "color",
    //   description: "Duotone icons only.",
    // },
    // accentHighlight: {
    //   control: "color",
    //   description: "Duotone icons only.",
    // },
  },
};

export default meta;

type Story = StoryObj<typeof Icons>;

export const Brand: Story = {
  args: {
    category: "brand",
  },
};

export const BrandColor: Story = {
  args: {
    category: "brandColor",
  },
};

export const Directional: Story = {
  args: {
    category: "directional",
  },
};

export const Duotone: Story = {
  args: {
    category: "duotone",
  },
};

export const State: Story = {
  args: {
    category: "state",
  },
};

export const Utility: Story = {
  args: {
    category: "utility",
  },
};

function Icons({
  category = "brand",
  size,
}: {
  category: keyof typeof iconsByCategory;
  size?: IconProps["size"];
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {iconsByCategory[category].map((Icon) => (
        <div className="border rounded flex flex-col items-center py-4 px-2 gap-2">
          {(() => {
            switch (category) {
              // case "state":
              //   return (
              //     <Comp
              //       m={1}
              //       boxSize={boxSize}
              //       color={color}
              //       variant={variant}
              //     />
              //   );
              case "duotone":
                return <Icon size={size} />;
              default:
                return <Icon size={size} />;
            }
          })()}
          <p className="text-xs text-muted-foreground">{Icon.displayName}</p>
        </div>
      ))}
    </div>
  );
}
