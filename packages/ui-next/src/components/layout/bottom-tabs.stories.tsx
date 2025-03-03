import type { Meta, StoryObj } from "@storybook/react";
import { BottomTab } from "#components/primitives";
import {
  ChestIcon,
  ClockIcon,
  PulseIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
} from "#components/icons";
import { LayoutBottomTabs, layoutBottomTabsVariants } from "#components/layout";
import { cn } from "#utils";

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
          <PulseIcon variant="line" size="lg" />
        </BottomTab>
        <BottomTab status="active">
          <ChestIcon variant="solid" size="lg" />
        </BottomTab>
        <BottomTab>
          <TrophyIcon variant="line" size="lg" />
        </BottomTab>
        <BottomTab>
          <SwordsIcon variant="line" size="lg" />
        </BottomTab>
        <BottomTab>
          <UsersIcon variant="line" size="lg" />
        </BottomTab>
        <BottomTab>
          <ClockIcon variant="line" size="lg" />
        </BottomTab>
      </div>
    ),
  },
};
