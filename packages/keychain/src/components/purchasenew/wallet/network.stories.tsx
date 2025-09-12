import type { Meta, StoryObj } from "@storybook/react";
import { ChooseNetwork } from "./network";
import { NavigationProvider } from "@/context";

const meta = {
  component: ChooseNetwork,
  decorators: [
    (Story) => (
      <NavigationProvider>
        <Story />
      </NavigationProvider>
    ),
  ],
} satisfies Meta<typeof ChooseNetwork>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onNetworkSelect: (networkId: string) =>
      console.log("Selected network:", networkId),
  },
};
