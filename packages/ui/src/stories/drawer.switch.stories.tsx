import { PLACEHOLDER } from "@/assets";
import { GlobeIcon } from "@/components";
import { Button } from "@/components/primitives/button";
import { Drawer, DrawerContent } from "@/components/primitives/drawer";
import { ControllerContainer } from "@/utils/mock/controller-container";

import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta: Meta<typeof DrawerSwitchStory> = {
  title: "Primitives/Drawers/Switch",
  component: DrawerSwitchStory,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof DrawerSwitchStory>;

export const Default: Story = {};

function DrawerSwitchStory() {
  const [drawerId, setDrawerId] = useState<"drawer-1" | "drawer-2" | null>(
    null,
  );

  return (
    <ControllerContainer>
      <div className="flex-grow" />
      <Button onClick={() => setDrawerId("drawer-1")}>Open</Button>

      <Drawer
        isOpen={drawerId === "drawer-1"}
        onClose={() => {
          if (drawerId === "drawer-1") {
            setDrawerId(null);
          }
        }}
      >
        <DrawerContent title="Drawer 1" icon={<GlobeIcon variant="solid" />}>
          <div className="bg-background-300 h-[200px]">
            <img src={PLACEHOLDER} className="m-auto" />
          </div>
          <Button onClick={() => setDrawerId("drawer-2")}>
            Switch to drawer 2...
          </Button>
        </DrawerContent>
      </Drawer>

      <Drawer
        isOpen={drawerId === "drawer-2"}
        onClose={() => {
          if (drawerId === "drawer-2") {
            setDrawerId(null);
          }
        }}
      >
        <DrawerContent title="Drawer 2" icon={<GlobeIcon variant="solid" />}>
          <div className="bg-background-300 h-[200px]">
            <img src={PLACEHOLDER} className="m-auto" />
          </div>
          <Button onClick={() => setDrawerId("drawer-1")}>
            Switch to drawer 1...
          </Button>
        </DrawerContent>
      </Drawer>
    </ControllerContainer>
  );
}
