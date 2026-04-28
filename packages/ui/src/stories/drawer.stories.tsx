import { GlobeIcon } from "@/components";
import { Button } from "@/components/primitives/button";
import { Drawer, DrawerContent } from "@/components/primitives/drawer";
import { ControllerContainer } from "@/utils/mock/controller-container";

import { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

const meta: Meta<typeof DrawerStory> = {
  title: "Primitives/Drawers/Simple",
  component: DrawerStory,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof DrawerStory>;

export const Default: Story = {};

function DrawerStory() {
  const [counter, setCounter] = useState<number>(-1);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  useEffect(
    () => setDrawerId(counter >= 0 ? `drawer-${counter}` : null),
    [counter],
  );
  useEffect(() => {
    if (drawerId === null) setCounter(-1);
  }, [drawerId]);

  return (
    <ControllerContainer>
      <div className="flex-grow" />
      <Button onClick={() => setCounter(5)}>Open</Button>
      <Drawer isOpen={drawerId !== null} onClose={() => setCounter(-1)}>
        <DrawerContent
          title="Drawer Example"
          icon={<GlobeIcon variant="solid" />}
        >
          {Array.from({ length: counter }).map((_, i) => (
            <div key={i} className="bg-background-300">
              step {counter - i}
            </div>
          ))}
          <Button onClick={() => setCounter(counter - 1)}>
            {counter > 0 ? `Complete step ${counter}` : "Finish"}
          </Button>
        </DrawerContent>
      </Drawer>
    </ControllerContainer>
  );
}
