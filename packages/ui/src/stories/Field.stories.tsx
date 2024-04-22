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
    touched: {
      control: "boolean",
    },
    error: {
      control: "text",
    },
  },
  args: {
    placeholder: "Username",
    // value: "Shinobi",
    touched: false,
    error: "",
    // onChange: (e) => console.log(e),
    // onClear: () => {
    //   console.log("Clear");
    // },
  },
};

export default meta;

type Story = StoryObj<typeof Field>;

export const Normal: Story = {};

// export const Hover: Story = {};

// export const Active: Story = {};

export const Error: Story = {
  args: {
    touched: true,
    error: "Cannot contain special characters",
  },
};
