import {
  HoverCard as UIHoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/primitives/hover-card";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof HoverCard> = {
  title: "Primitives/Hover Card",
  component: HoverCard,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {};

function HoverCard() {
  return (
    <UIHoverCard>
      <HoverCardTrigger>Hover</HoverCardTrigger>
      <HoverCardContent>
        Some insightful information about the hover trigger
      </HoverCardContent>
    </UIHoverCard>
  );
}
