import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { PaymentMethod } from "./method";
import { NavigationProvider, StarterpackProviders } from "@/context";

const meta = {
  component: PaymentMethod,
  decorators: [
    (Story: ComponentType) => (
      <NavigationProvider>
        <StarterpackProviders>
          <Story />
        </StarterpackProviders>
      </NavigationProvider>
    ),
  ],
} satisfies Meta<typeof PaymentMethod>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
