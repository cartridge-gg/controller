import type { Meta, StoryObj } from "@storybook/react";
import { AchievementTabs } from "./tabs";
import { Button, TabsContent } from "@/index";
import { useState } from "react";

const meta: Meta<typeof AchievementTabs> = {
  title: "Modules/Achievements/Tabs",
  component: AchievementTabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof AchievementTabs>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("achievements");
    return (
      <AchievementTabs
        count={4}
        total={10}
        rank={16}
        value={value}
        onValueChange={setValue}
      >
        <TabsContent
          className="p-0 mt-0 flex gap-4 items-center"
          value="achievements"
        >
          <h1 className="text-foreground-100 p-4">Achievements content</h1>
          <Button onClick={() => setValue("achievements")}>Reset</Button>
        </TabsContent>
        <TabsContent
          className="p-0 mt-0 flex gap-4 items-center"
          value="leaderboard"
        >
          <h1 className="text-foreground-100 p-4">Leaderboard content</h1>
          <Button onClick={() => setValue("achievements")}>Reset</Button>
        </TabsContent>
      </AchievementTabs>
    );
  },
};
