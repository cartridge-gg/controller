import { Grid, GridItem, IconProps, Text, VStack } from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import {
  brandIcons,
  brandColorIcons,
  directionalIcons,
  duotoneIcons,
  stateIcons,
  utilityIcons,
} from "../components/icons";

const iconList = {
  brand: brandIcons,
  "brand-color": brandColorIcons,
  directional: directionalIcons,
  duotone: duotoneIcons,
  state: stateIcons,
  utility: utilityIcons,
};

/**
 *
 * Browse all icons or filter by category.
 *
 * Note: `<Icons />` is only meant for demonstration purpose.
 *
 * ## Usage
 *
 * ```jsx
 *
 * <IconName
 *  boxSize={8}           // default: 4
 *  color="brand.primary" // default: "text.primary"
 * />
 * ```
 */
const meta: Meta<typeof Icons> = {
  title: "Icon",
  component: Icons,
  tags: ["autodocs"],
  argTypes: {
    category: {
      control: "select",
      options: Object.keys(iconList),
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

export const BrandColor: Story = {
  args: {
    category: "brand-color",
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
  category = "state",
  boxSize,
  color,
  ...duotoneProps
}: {
  category: keyof typeof iconList;
  boxSize: number;
  color: string;
  accent?: string;
  accentHighlight?: string;
}) {
  return (
    <Grid templateColumns="repeat(6, 1fr)" gap={2}>
      {Object.entries(iconList[category]).map(([name, Comp]) => {
        return (
          <GridItem key={name}>
            <VStack
              px={2}
              py={4}
              border="1px solid"
              borderColor="text.secondary"
              borderRadius={4}
            >
              {category === "duotone" ? (
                <Comp m={1} boxSize={boxSize} color={color} {...duotoneProps} />
              ) : (
                <Comp m={1} boxSize={boxSize} color={color} />
              )}
              <Text fontSize="2xs">{name}</Text>
            </VStack>
          </GridItem>
        );
      })}
    </Grid>
  );
}
