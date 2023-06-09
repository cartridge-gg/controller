import { Box, Text, VStack, HStack } from "@chakra-ui/react";
import type { Meta } from "@storybook/react";
import colors from "../theme/colors";

const meta: Meta<typeof Colors> = {
  title: "Color",
  component: Colors,
};

function Colors() {
  return (
    <VStack align="left">
      {Object.entries(colors)
        .filter(([colorName]) => colorName !== "legacy")
        .map(([colorName, v]) => (
          <VStack align="left" m={2} key={colorName}>
            <Text>{colorName[0].toUpperCase() + colorName.slice(1)}</Text>
            <HStack>
              {typeof v !== "string" ? (
                Object.entries(v)
                  .sort(([k1], [k2]) => (k1 < k2 ? -1 : 1))
                  .map(([gradient, colorValue]) => (
                    <Item
                      key={colorName + gradient}
                      colorName={colorName}
                      gradient={gradient}
                      colorValue={colorValue}
                    />
                  ))
              ) : (
                <Item colorName={colorName} colorValue={v} />
              )}
            </HStack>
          </VStack>
        ))}
    </VStack>
  );
}

function Item({
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
      <Box w={32} h={32} m={1} bgColor={bgColor} />
      <Text>{gradient}</Text>
      <Text color="darkGray.100" fontSize="xs">
        {colorValue}
      </Text>
    </VStack>
  );
}

export default meta;

export const All = {
  args: {},
};
