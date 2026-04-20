import { Skeleton as UISkeleton } from "@/components/primitives/skeleton";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Skeleton> = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {};

function Skeleton() {
  return (
    <div className="flex items-center space-x-4">
      <UISkeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <UISkeleton className="h-4 w-[250px]" />
        <UISkeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
