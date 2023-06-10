import type { Meta } from "@storybook/react";
import { VStack, Flex, Text, IconProps } from "@chakra-ui/react";
import {
  stateIcons,
  brandIcons,
  brandColorIcons,
  utilityIcons,
  directionalIcons,
  duotoneIcons,
} from "../components/icons";
import { Props } from "../components/icons/types";

const meta: Meta<typeof Icons> = {
  title: "Icon",
  component: Icons,
};

function Icons() {
  return (
    <>
      <Section title="State Icons" icons={Object.values(stateIcons)} />
      <Section
        title="Brand Icons"
        icons={Object.entries(brandIcons)
          .filter(([name]) => !["Word", "Logo"].includes(name))
          .map(([, Comp]) => Comp)}
      />
      <Section title="Utility Icons" icons={Object.values(utilityIcons)} />
      <Section
        title="Brand Color Icons"
        icons={Object.values(brandColorIcons)}
      />
      <Section
        title="Directional Icons"
        icons={Object.values(directionalIcons)}
      />
      <Section title="Duotone Icons" icons={Object.values(duotoneIcons)} />
      {/* TODO: Quest and Portal icons */}
    </>
  );
}

function Section({
  title,
  icons,
  ...iconProps
}: {
  title: string;
  icons: React.FunctionComponent<
    Props & {
      tone?: string;
    }
  >[];
} & IconProps) {
  return (
    <VStack align="left" m={4}>
      <Text>{title}</Text>
      <Flex>
        {icons.map((Comp) => (
          <Comp m={1} {...iconProps} />
        ))}
      </Flex>
    </VStack>
  );
}

export default meta;

export const All = {
  args: {},
};
