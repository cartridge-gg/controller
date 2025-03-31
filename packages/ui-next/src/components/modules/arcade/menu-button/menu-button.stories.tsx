import type { Meta, StoryObj } from "@storybook/react";
import { ArcadeMenuButton } from "./menu-button";
import { Select } from "@/index";

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Select>{children}</Select>
);

const meta: Meta<typeof ArcadeMenuButton> = {
  title: "Modules/Arcade/Menu Button",
  component: ArcadeMenuButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ArcadeMenuButton>;

export const Default: Story = {
  render: () => (
    <Wrapper>
      <ArcadeMenuButton variant="default" />
    </Wrapper>
  ),
};

export const Active: Story = {
  render: () => (
    <Wrapper>
      <ArcadeMenuButton active variant="default" />
    </Wrapper>
  ),
};
