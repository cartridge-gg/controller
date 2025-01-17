import { Meta, StoryObj } from "@storybook/react";
import { PropsWithChildren } from "react";

const meta: Meta<typeof Colors> = {
  title: "Colors",
  component: Colors,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Colors>;

export const Surface: Story = {
  args: {
    children: (
      <>
        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-background text-xs">
          <div>bg-background</div>
        </div>

        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-background-100 text-xs">
          <div>bg-background-100</div>
        </div>

        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-background-200 text-xs">
          <div>bg-background-200</div>
        </div>

        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-background-300 text-xs">
          <div>bg-background-300</div>
        </div>
      </>
    ),
  },
};

export const Accent: Story = {
  args: {
    children: (
      <>
        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-primary text-primary-foreground text-xs">
          <div>bg-primary</div>
          <div>text-primary-foreground</div>
        </div>

        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-secondary text-xs">
          <div>bg-secondary</div>
        </div>
      </>
    ),
  },
};

export const Muted: Story = {
  args: {
    children: (
      <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-muted text-muted-foreground text-xs">
        <div>bg-muted</div>
        <div>text-muted-foreground</div>
      </div>
    ),
  },
};

export const Destructive: Story = {
  args: {
    children: (
      <>
        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-destructive text-xs">
          <div>bg-destructive</div>
        </div>
        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-destructive-100 text-xs">
          <div>bg-destructive-100</div>
        </div>
        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-destructive-foreground text-xs">
          <div>bg-destructive-foreground</div>
        </div>
      </>
    ),
  },
};

function Colors(props: PropsWithChildren) {
  return <div className="flex gap-4" {...props} />;
}
