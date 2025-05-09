import {
  Menubar as UIMenubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/primitives/menubar";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Menubar> = {
  title: "Primitives/Menubar",
  component: Menubar,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Menubar>;

export const Default: Story = {};

function Menubar() {
  return (
    <UIMenubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Share</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </UIMenubar>
  );
}
