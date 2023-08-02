import { Grid, GridItem, Text, VStack } from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import {
  brandIcons,
  brandColorIcons,
  directionalIcons,
  duotoneIcons,
  stateIcons,
  utilityIcons,
} from "../components/icons/index";
import { Props, DuotoneIconProps } from "../components/icons/types";

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
 *  boxSize={8}           // default: 6
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
      options: ["all", ...Object.keys(iconList)],
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
  args: {
    category: "all",
    boxSize: 6,
    color: "text.primary",
    accent: "brand.accent",
    accentHighlight: "brand.accentHighlight",
  },
};

export default meta;

type Story = StoryObj<typeof Icons>;

export const All: Story = {};

function Icons({
  category,
  boxSize,
  color,
  ...duotoneProps
}: {
  category: "all" | keyof typeof iconList;
  boxSize: number;
  color: string;
  accent?: string;
  accentHighlight?: string;
}) {
  const list =
    category === "all"
      ? Object.values(iconList).reduce((prev, c) => ({ ...prev, ...c }), {})
      : iconList[category];

  return (
    <Grid templateColumns="repeat(6, 1fr)" gap={2}>
      {Object.entries(
        list as { [key: string]: React.FC<Props> | React.FC<DuotoneIconProps> },
      ).map(([name, Comp]) => {
        const isDuotone = Comp.displayName?.includes("DuoIcon");

        return (
          <GridItem key={name}>
            <VStack
              px={2}
              py={4}
              border="1px solid"
              borderColor="text.secondary"
              borderRadius={4}
            >
              {isDuotone ? (
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
