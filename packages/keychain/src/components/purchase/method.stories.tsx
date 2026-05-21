import type { Meta, StoryObj, StoryFn } from "@storybook/react";
import { PaymentMethod } from "./method";
import { NavigationProvider, StarterpackProviders } from "@/context";

const meta = {
  component: PaymentMethod,
  decorators: [
    (Story: StoryFn) => (
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
