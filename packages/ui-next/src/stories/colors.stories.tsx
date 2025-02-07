import { Meta, StoryObj } from "@storybook/react";
import { PropsWithChildren } from "react";

const meta: Meta<typeof Colors> = {
  title: "Primitives/Colors",
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
          <div>(bg-background)</div>
        </div>

        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-background-100 text-xs">
          <div>bg-background-100</div>
          <div>(solid-fills/bg-primary)</div>
        </div>

        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-background-200 text-xs">
          <div>bg-background-200</div>
          <div>(solid-fills/bg-secondary)</div>
        </div>

        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-background-300 text-xs">
          <div>bg-background-300</div>
          <div>(solid-fills/bg-tertiary)</div>
        </div>
      </>
    ),
  },
};

export const Text: Story = {
  args: {
    children: (
      <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-foreground text-xs text-background">
        <div>bg-foreground</div>
        <div>(text-primary)</div>
        <div>text-background</div>
      </div>
    ),
  },
};

export const Muted: Story = {
  args: {
    children: (
      <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-muted text-muted-foreground text-xs">
        <div>bg-muted</div>
        <div>text-muted-foreground</div>
        <div>(text.secondary)</div>
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
          <div>(Red/500)</div>
        </div>
        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-destructive-foreground text-xs">
          <div>bg-destructive-foreground</div>
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
          <div className="mb-2">(theme.colors.primary)</div>
          <div className="flex flex-col items-center w-full overflow-x-auto">
            <div>text-primary-foreground</div>
            <div>(theme.colors.primaryForeground)</div>
          </div>
        </div>

        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-secondary text-xs">
          <div>bg-secondary</div>
          <div>(Used in Duotone)</div>
        </div>
      </>
    ),
  },
};

export const Others: Story = {
  args: {
    children: (
      <>
        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-border text-xs">
          <div>bg-border</div>
          <div>(--background/0.12)</div>
        </div>

        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-input text-xs">
          <div>bg-input</div>
          <div>(--background-200/0.12)</div>
        </div>

        <div className="size-40 flex flex-shrink-0 flex-col items-center justify-center bg-spacer text-xs">
          <div>bg-spacer</div>
          <div>(spacer)</div>
        </div>
      </>
    ),
  },
};

function Colors(props: PropsWithChildren) {
  return <div className="flex gap-4" {...props} />;
}
