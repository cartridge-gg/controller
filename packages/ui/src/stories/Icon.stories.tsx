import { Grid, GridItem, Text, VStack } from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import * as icons from "../components/icons/index";

/**
 *
 * Collection of Icons.
 */
const meta: Meta<typeof Icons> = {
  title: "Icon",
  component: Icons,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "color",
    },
  },
  args: {},
};

export default meta;

type Story = StoryObj<typeof Icons>;

export const General: Story = {};

function Icons({ color }: { color: string }) {
  return (
    <Grid templateColumns="repeat(6, 1fr)" gap={2}>
      {Object.entries(icons).map(([name, Icon]) => (
        <GridItem key={name}>
          <VStack
            // m={2}
            p={4}
            border="1px solid"
            borderColor="text.secondary"
            borderRadius={4}
          >
            <Icon m={1} color={color} />
            <Text fontSize="xs">{name}</Text>
          </VStack>
        </GridItem>
      ))}
    </Grid>
  );
}
