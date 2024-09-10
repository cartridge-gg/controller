import { VStack, HStack, Text, Box } from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import { colors } from "../theme/colors";

/**
 *
 * Collection of colors based on local variables from [Figma](https://www.figma.com/file/6ZQgwNrqpRlMg9GFbA41dv/Components?type=design&node-id=1%3A3070&mode=design&t=ITTcq5pR4KR2VzOu-1).
 *
 * Check out `Color (Senmantic Tokens)` page also for real usage of colors.
 */
const meta: Meta<typeof Palette> = {
  title: "Color",
  component: Palette,
  tags: ["autodocs"],
  argTypes: {
    colorName: {
      control: "select",
      description: "Base color name",
      options: Object.keys(colors),
    },
  },
};

export default meta;

type Story = StoryObj<typeof Palette>;

export const Green: Story = {
  args: {
    colorName: "green",
  },
};

export const DarkGray: Story = {
  args: {
    colorName: "darkGray",
  },
};

export const BlueGray: Story = {
  args: {
    colorName: "blueGray",
  },
};

export const OpacityWhite: Story = {
  args: {
    colorName: "opacityWhite",
  },
};

export const OpacityBlack: Story = {
  args: {
    colorName: "opacityBlack",
  },
};

export const Transparent: Story = {
  args: {
    colorName: "transparent",
  },
};

export const White: Story = {
  args: {
    colorName: "white",
  },
};

export const Black: Story = {
  args: {
    colorName: "black",
  },
};

type ColorsProps = {
  colorName: keyof typeof colors;
};

function Palette({ colorName }: ColorsProps) {
  const values = colors[colorName];

  return (
    <HStack overflowX="auto">
      {typeof values !== "string" ? (
        Object.entries(values)
          .sort(([k1], [k2]) => (k1 < k2 ? -1 : 1))
          .map(([gradient, colorValue]) => (
            <ColorSample
              key={colorName + gradient}
              colorName={colorName}
              gradient={gradient}
              colorValue={colorValue as string}
            />
          ))
      ) : (
        <ColorSample colorName={colorName} colorValue={values} />
      )}
    </HStack>
  );
}

function ColorSample({
  colorName,
  gradient,
  colorValue,
}: {
  colorName: string;
  colorValue: string;
  gradient?: string;
}) {
  const bgColor = gradient ? `${colorName}.${gradient}` : colorName;

  return (
    <VStack>
      <Box w={32} h={32} bgColor={bgColor} />
      <Text>{gradient}</Text>
      <Text fontSize="xs">{colorValue}</Text>
    </VStack>
  );
}
