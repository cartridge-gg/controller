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

export const Default: Story = {
  args: {
    children: (
      <>
        <Sample color="bg-background border" legacyName="bg" />
        <Sample color="bg-foreground" legacyName="text.primary" />
      </>
    ),
  },
};

export const Popover: Story = {
  args: {
    children: (
      <>
        <Sample color="bg-popover border" legacyName="bg" />
        <Sample color="bg-popover-foreground" legacyName="text.primary" />
      </>
    ),
  },
};

export const Primary: Story = {
  args: {
    children: (
      <>
        <Sample color="bg-primary" legacyName="brand.primary" />
        <Sample color="bg-primary-foreground border" legacyName="bg" />
      </>
    ),
  },
};

export const Secondary: Story = {
  args: {
    children: (
      <>
        <Sample color="bg-secondary" legacyName="solid.primary" />
        <Sample
          color="bg-secondary-foreground border"
          legacyName="text.primary"
        />
      </>
    ),
  },
};

export const Tertiary: Story = {
  args: {
    children: (
      <>
        <Sample color="bg-tertiary" legacyName="solid.accent" />
        <Sample color="bg-tertiary-foreground border" legacyName="bg" />
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

export const Accent: Story = {
  args: {
    children: (
      <>
        <Sample color="bg-accent" legacyName="solid.accent" />
        <Sample
          color="bg-accent-foreground"
          legacyName="solid.secondaryAccent"
        />
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
        <Sample color="bg-ring" legacyName="text.primary" />
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
