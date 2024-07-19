import { Meta, StoryObj } from "@storybook/react";
import { Field } from "../components/Field";

const meta: Meta<typeof Field> = {
  title: "Field",
  component: Field,
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
    },
    value: {
      control: "text",
    },
    error: {
      control: "text",
    },
  },
  args: {
    placeholder: "Username",
  },
};

export default meta;

type Story = StoryObj<typeof Field>;

export const Normal: Story = {};

// export const Hover: Story = {};

// export const Active: Story = {};

export const Error: Story = {
  args: {
    error: { type: "validate", message: "Cannot contain special characters" },
  },
};
