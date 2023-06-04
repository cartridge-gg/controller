import { Flex, Text, chakra } from "@chakra-ui/react";
import type { Meta } from "@storybook/react";
import colors from "../theme/colors";

const meta: Meta<typeof Colors> = {
  title: "Colors",
  component: Colors,
};

function Colors() {
  return (
    <Flex flexDir="column">
      {Object.entries(colors)
        .filter(([colorName]) => colorName !== "legacy")
        .map(([colorName, v], i) => (
          <Flex flexDir="column" m={2} key={colorName}>
            <Text>{colorName[0].toUpperCase() + colorName.slice(1)}</Text>
            <Flex>
              {typeof v !== "string" ? (
                Object.entries(v)
                  .sort(([k1], [k2]) => (k1 < k2 ? -1 : 1))
                  .map(([gradient, colorValue]) => {
                    return (
                      <Item
                        key={colorName + gradient}
                        colorName={colorName}
                        gradient={gradient}
                        colorValue={colorValue}
                      />
                    );
                  })
              ) : (
                <Item colorName={colorName} colorValue={v} />
              )}
            </Flex>
          </Flex>
        ))}
    </Flex>
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
    <Flex flexDir="column" alignItems="center">
      <Sample bgColor={bgColor} />
      <Text>{gradient}</Text>
      <Text color="darkGray.100" fontSize="xs">
        {colorValue}
      </Text>
    </Flex>
  );
}

const Sample = chakra(Flex, {
  baseStyle: {
    w: 32,
    h: 32,
    m: 1,
  },
});

export default meta;

export const List = {
  args: {
    // children: "Press me",
    // variant: "yellow",
  },
};
