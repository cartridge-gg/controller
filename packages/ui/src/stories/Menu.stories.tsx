import {
  Menu as ChakraMenu,
  HStack,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import {
  DopeWarsIcon,
  MirrorWedgeIcon,
  SpaceInvaderIcon,
} from "src/components";

const meta: Meta<typeof Menu> = {
  title: "Menu",
  component: Menu,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Menu>;

export const Example: Story = {
  args: {},
};

function Menu() {
  return (
    <ChakraMenu>
      <MenuButton>
        <HStack>
          <Text>Menu</Text>
          <MirrorWedgeIcon />
        </HStack>
      </MenuButton>

      <MenuList>
        <MenuItem
          icon={<DopeWarsIcon fontSize="2xl" />}
          color="brand.primary"
          _hover={{ color: "brand.primary" }}
          isDisabled
        >
          Roll Your Own
        </MenuItem>
        <MenuItem icon={<SpaceInvaderIcon fontSize="2xl" />}>Tsubasa</MenuItem>
        <MenuItem icon={<SpaceInvaderIcon fontSize="2xl" />}>Drive AI</MenuItem>
        <MenuItem icon={<SpaceInvaderIcon fontSize="2xl" />}>
          Stark Lander
        </MenuItem>
      </MenuList>
    </ChakraMenu>
  );
}
