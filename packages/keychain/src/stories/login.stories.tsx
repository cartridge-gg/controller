import { Meta, StoryObj } from "@storybook/react";

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

function Login() {
  return <div>Login</div>;
}
