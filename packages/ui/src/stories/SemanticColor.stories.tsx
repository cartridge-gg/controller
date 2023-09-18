import { VStack, HStack, Text as CText, Box } from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import { semanticTokens } from "../theme/semanticTokens";

/**
 *
 * Semantic color names. It's like an arias. Check `Color` page also for more.
 */
const meta: Meta<typeof Palette> = {
  title: "Color (Semtantic Tokens)",
  component: Palette,
  tags: ["autodocs"],
  argTypes: {
    colorName: {
      control: "select",
      description: "Base color name",
      options: Object.keys(semanticTokens.colors),
    },
  },
};

export default meta;

type Story = StoryObj<typeof Palette>;

export const Text: Story = {
  args: {
    colorName: "text",
  },
};

export const Brand: Story = {
  args: {
    colorName: "brand",
  },
};

export const Solid: Story = {
  args: {
    colorName: "solid",
  },
};

export const Translucent: Story = {
  args: {
    colorName: "translucent",
  },
};

type ColorsProps = {
  colorName: keyof typeof semanticTokens.colors;
};

function Palette({ colorName }: ColorsProps) {
  return (
    <HStack overflowX="auto">
      {Object.keys(semanticTokens.colors[colorName])
        .sort((k1, k2) => (k1 < k2 ? -1 : 1))
        .map((variant) => (
          <ColorSample
            key={colorName + variant}
            colorName={colorName}
            variant={variant}
          />
        ))}
    </HStack>
  );
}

function ColorSample({
  colorName,
  variant,
}: {
  colorName: string;
  variant: string;
}) {
  const bgColor = `${colorName}.${variant}`;

  return (
    <VStack>
      <Box w={32} h={32} bgColor={bgColor} />
      <CText fontSize="xs">{variant}</CText>
    </VStack>
  );
}
