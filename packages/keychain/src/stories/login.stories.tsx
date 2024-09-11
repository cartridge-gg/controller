import { Meta, StoryObj } from "@storybook/react";
import { Login } from "../components/connect";

const meta: Meta<typeof Login> = {
  title: "Login",
  component: Login,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Login>;

export const Default: Story = {
  args: {},
};
