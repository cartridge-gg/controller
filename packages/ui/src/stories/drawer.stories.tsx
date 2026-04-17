import { Button } from "@/components/primitives/button";
import {
  Drawer as UIDrawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/primitives/drawer";

import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Drawer> = {
  title: "Primitives/Drawer",
  component: Drawer,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {};

function Drawer() {
  return (
    <UIDrawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </UIDrawer>
  );
}
