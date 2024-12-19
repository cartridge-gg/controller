import { Meta, StoryObj } from "@storybook/react";
import { ErrorPage } from "./ErrorBoundary";

const meta: Meta<typeof ErrorPage> = {
  title: "@/components/ErrorPage",
  component: ErrorPage,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof ErrorPage>;

export const Default: Story = {
  args: {
    error: new Error("Something went wrong while processing your request"),
  },
};

export const LongError: Story = {
  args: {
    error: new Error(
      "This is a very long error message that should wrap to multiple lines. It contains lots of details about what went wrong and how to potentially fix it. The error occurred while trying to process something important.",
    ),
  },
};
