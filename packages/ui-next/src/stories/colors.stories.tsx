import { cn } from "@/utils";
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
        <div className="size-40 flex flex-col items-center justify-center bg-background border border-muted/40 text-xs">
          <div>bg-background</div>
        </div>

        <div className="size-40 flex flex-col items-center justify-center bg-background-100 text-xs">
          <div>bg-background-100</div>
        </div>
      </>
    ),
  },
};

export const Accent: Story = {
  args: {
    children: (
      <>
        <div className="size-40 flex flex-col items-center justify-center bg-primary text-primary-foreground text-xs">
          <div>bg-primary</div>
          <div>text-primary-foreground</div>
        </div>

        <div className="size-40 flex flex-col items-center justify-center bg-secondary text-xs">
          <div>bg-secondary</div>
        </div>
      </>
    ),
  },
};

export const Muted: Story = {
  args: {
    children: (
      <>
        <Sample color="bg-muted" legacyName="solid.accent" />
        <Sample color="bg-muted-foreground" legacyName="text.secondary" />
      </>
    ),
  },
};

export const Destructive: Story = {
  args: {
    children: (
      <>
        <Sample color="bg-destructive" legacyName="text.error" />
        <Sample color="bg-destructive-foreground" legacyName="text.error" />
      </>
    ),
  },
};

export const Others: Story = {
  args: {
    children: (
      <>
        <Sample color="bg-border" legacyName="black" />
        <Sample color="bg-input" legacyName="black" />
      </>
    ),
  },
};

function Colors({ children }: PropsWithChildren) {
  return <div className="flex gap-4 bg-background">{children}</div>;
}

function Sample({ color, legacyName }: { color: string; legacyName: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("h-40 w-40", color)} />
      <p className="text-sm">{color.replace(" border", "")}</p>
      <p className="text-sm text-muted-foreground">(v0.2: {legacyName})</p>
    </div>
  );
}
