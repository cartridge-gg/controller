import type { Meta, StoryObj } from "@storybook/react";
import { Button, Flex, Text, VStack } from "@chakra-ui/react";
import Copy from "../components/icons/Copy";
import Globe from "../components/icons/Globe";

const meta: Meta<typeof Buttons> = {
  title: "Button",
  component: Buttons,
  argTypes: {
    variant: {
      options: ["form", "label", "labelRounded"],
      control: { type: "radio" },
    },
    size: {
      options: ["sm", "md"],
      control: { type: "radio" },
    },
    icon: {
      options: ["None", "Left", "Right", "Why Not Both?"],
      control: { type: "radio" },
    },
  },
};

export default meta;

function Buttons({
  hideChildren,
  children,
  icon,
  ...buttonProps
}: React.ComponentProps<typeof Button> & {
  hideChildren: boolean;
  icon: "None" | "Left" | "Right" | "Why Not Both?";
}) {
  return (
    <Flex>
      {colorSchemes.map((c) => (
        <VStack key={c} m={1}>
          <Text
            m={3}
            fontSize="md"
            fontWeight="bold"
            textDecor="underline"
            textTransform="capitalize"
          >
            {c}
          </Text>

          <Button
            colorScheme={c}
            leftIcon={
              ["Why Not Both?", "Left"].includes(icon) ? <Globe /> : undefined
            }
            rightIcon={
              ["Why Not Both?", "Right"].includes(icon) ? <Copy /> : undefined
            }
            onClick={() => {
              console.log("Clicked !");
            }}
            children={hideChildren ? undefined : children}
            {...buttonProps}
          />
        </VStack>
      ))}
    </Flex>
  );
}

const colorSchemes = [
  "yellow",
  "purple",
  "darkGray",
  "blueGray",
  "whiteAlpha",
  "blackAlpha",
];

type Story = StoryObj<typeof Buttons>;

export const All: Story = {
  args: {
    variant: "form",
    size: "sm",
    children: "continue",
    hideChildren: false,
    icon: "None",
    isDisabled: false,
    isLoading: false,
  },
};
