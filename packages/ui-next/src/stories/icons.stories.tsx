import { brandColorIcons, brandIcons } from "@/components/icons";
import {
  DuotoneIconProps,
  IconProps,
  StateIconProps,
} from "@/components/icons/types";
import { size, duotoneVariant } from "@/components/icons/utils";
import { cn } from "@/utils";
import { Meta, StoryObj } from "@storybook/react";
import { ComponentType } from "react";

const iconsByCategory = {
  brand: brandIcons,
  "brand-color": brandColorIcons,
  // directional: [],
  // duotone: [AlertDuoIcon],
  // state: [BoltIcon],
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
    className: {
      control: "text",
    },
    size: {
      control: "radio",
      options: Object.keys(size),
      table: {
        defaultValue: { summary: "default" },
      },
    },
    duotoneVariant: {
      control: "radio",
      options: Object.keys(duotoneVariant),
      description: "Duotone icons only.",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    stateVariant: {
      control: "radio",
      options: ["solid", "line"],
      defaultValue: "solid",
      description: "State icons only.",
      table: {
        defaultValue: { summary: "solid" },
      },
    },
  },
  args: {
    category: "brand",
    className: "text-foreground",
    size: "default",
    duotoneVariant: "default",
    stateVariant: "solid",
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
    category: "brand-color",
  },
};

// export const Directional: Story = {
//   args: {
//     category: "directional",
//   },
// };

// export const Duotone: Story = {
//   args: {
//     category: "duotone",
//   },
// };

// export const State: Story = {
//   args: {
//     category: "state",
//   },
// };

// export const Utility: Story = {
//   args: {
//     category: "utility",
//   },
// };

function Icons({
  className,
  category,
  size,
}: // duotoneVariant,
// stateVariant,
{
  className: string;
  category: keyof typeof iconsByCategory;
  size?: IconProps["size"];
  duotoneVariant?: DuotoneIconProps["variant"];
  stateVariant: StateIconProps["variant"];
}) {
  return (
    <div className="grid grid-cols-3 sm:grip-cols-4 md:grid-cols-6 gap-2">
      {Object.entries(iconsByCategory[category]).map(([, icon]) => (
        <div
          key={icon.displayName}
          className={cn(
            "border rounded flex flex-col items-center py-4 px-2 gap-2 overflow-hidden",
            className,
          )}
        >
          {(() => {
            switch (category) {
              // case "duotone": {
              //   const DuotoneIcon = icon as ComponentType<DuotoneIconProps>;
              //   return <DuotoneIcon size={size} variant={duotoneVariant} />;
              // }
              // case "state": {
              //   const StateIcon = icon as ComponentType<StateIconProps>;
              //   return <StateIcon size={size} variant={stateVariant} />;
              // }
              default: {
                const Icon = icon as ComponentType<IconProps>;
                return <Icon size={size} />;
              }
            }
          })()}
          <p className="text-[10px] md:text-xs text-muted-foreground">
            {icon.displayName}
          </p>
        </div>
      ))}
    </div>
  );
}
