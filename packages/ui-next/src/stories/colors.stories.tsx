import { Meta, StoryObj } from "@storybook/react";
import { PropsWithChildren } from "react";

function Colors(props: PropsWithChildren) {
  return <div className="flex gap-4" {...props} />;
}

function Palette({ color, label }: { color: string; label: string }) {
  return (
    <div className="size-36 flex flex-shrink-0 flex-col text-xs rounded-lg overflow-hidden">
      <div className={`${color} h-2/3 flex justify-center items-center`}>
        {window
          .getComputedStyle(document.documentElement)
          .getPropertyValue(color.replace("bg", "-"))}
      </div>
      <div className="bg-spacer-100 flex justify-center items-center h-1/3">
        {label}
      </div>
    </div>
  );
}

const meta: Meta<typeof Colors> = {
  title: "Colors/Palette",
  component: Colors,
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0F1410" }],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Colors>;

export const Background: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-background" label="bg-background" />
        <Palette color="bg-background-100" label="bg-background-100" />
        <Palette color="bg-background-125" label="bg-background-125" />
        <Palette color="bg-background-150" label="bg-background-150" />
        <Palette color="bg-background-200" label="bg-background-200" />
        <Palette color="bg-background-300" label="bg-background-300" />
        <Palette color="bg-background-400" label="bg-background-400" />
        <Palette color="bg-background-500" label="bg-background-500" />
      </>
    ),
  },
};

export const Destructive: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-destructive" label="bg-destructive" />
        <Palette color="bg-destructive-100" label="bg-destructive-100" />
      </>
    ),
  },
};

export const Constructive: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-constructive" label="bg-constructive" />
        <Palette color="bg-constructive-100" label="bg-constructive-100" />
      </>
    ),
  },
};

export const Spacer: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-spacer" label="bg-spacer" />
        <Palette color="bg-spacer-100" label="bg-spacer-100" />
      </>
    ),
  },
};

export const Foreground: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-foreground" label="text-foreground" />
        <Palette color="bg-foreground-100" label="text-foreground-100" />
        <Palette color="bg-foreground-200" label="text-foreground-200" />
        <Palette color="bg-foreground-300" label="text-foreground-300" />
        <Palette color="bg-foreground-400" label="text-foreground-400" />
      </>
    ),
  },
};

export const Primary: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-primary" label="bg-primary" />
        <Palette color="bg-primary-100" label="bg-primary-100" />
        <Palette color="bg-primary-200" label="bg-primary-200" />
      </>
    ),
  },
};

export const Secondary: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-secondary" label="bg-secondary" />
        <Palette color="bg-secondary-100" label="bg-secondary-100" />
      </>
    ),
  },
};

export const TranslucentDark: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-translucent-dark" label="bg-translucent-dark" />
        <Palette
          color="bg-translucent-dark-100"
          label="bg-translucent-dark-100"
        />
        <Palette
          color="bg-translucent-dark-150"
          label="bg-translucent-dark-150"
        />
        <Palette
          color="bg-translucent-dark-200"
          label="bg-translucent-dark-200"
        />
        <Palette
          color="bg-translucent-dark-300"
          label="bg-translucent-dark-300"
        />
      </>
    ),
  },
};

export const TranslucentLight: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-translucent-light" label="bg-translucent-light" />
        <Palette
          color="bg-translucent-light-100"
          label="bg-translucent-light-100"
        />
        <Palette
          color="bg-translucent-light-150"
          label="bg-translucent-light-150"
        />
        <Palette
          color="bg-translucent-light-200"
          label="bg-translucent-light-200"
        />
        <Palette
          color="bg-translucent-light-300"
          label="bg-translucent-light-300"
        />
      </>
    ),
  },
};
