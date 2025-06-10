import type { Meta, StoryObj } from "@storybook/react";
import { PageLoading } from "./Loading";

const meta: Meta<typeof PageLoading> = {
  title: "Components/PageLoading",
  component: PageLoading,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof PageLoading>;

export const Default: Story = {
  args: {},
};

export const WithHiddenHeader: Story = {
  args: {
    headerVariant: "hidden",
  },
};

export const WithCustomTitle: Story = {
  args: {
    title: "Loading Your Game",
    description: "Please wait while we prepare your experience",
  },
};

export const WithReactElementDescription: Story = {
  args: {
    title: "Connecting to Cartridge",
    description: (
      <>
        <span className="font-bold">Cartridge</span> is preparing your
        controller
      </>
    ),
  },
};
