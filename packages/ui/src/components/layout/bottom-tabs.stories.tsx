import type { Meta, StoryObj } from "@storybook/react";
import { LayoutBottomTabs, layoutBottomTabsVariants } from "./index";
import { BottomTab } from "@/index";
import {
  ChestIcon,
  ClockIcon,
  PulseIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
} from "../icons";
import { cn } from "@/utils";

const meta: Meta<typeof LayoutBottomTabs> = {
  title: "Layout/BottomTabs",
  component: LayoutBottomTabs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof LayoutBottomTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div
        className={cn(
          layoutBottomTabsVariants(),
          "px-0 py-0 border-t-0 shadow-none",
        )}
      >
        <BottomTab>
          <PulseIcon variant="solid" size="lg" />
        </BottomTab>
        <BottomTab status="active">
          <ChestIcon variant="solid" size="lg" />
        </BottomTab>
        <BottomTab>
          <TrophyIcon variant="solid" size="lg" />
        </BottomTab>
        <BottomTab>
          <SwordsIcon variant="solid" size="lg" />
        </BottomTab>
        <BottomTab>
          <UsersIcon variant="solid" size="lg" />
        </BottomTab>
        <BottomTab>
          <ClockIcon variant="solid" size="lg" />
        </BottomTab>
      </div>
    ),
  },
};
