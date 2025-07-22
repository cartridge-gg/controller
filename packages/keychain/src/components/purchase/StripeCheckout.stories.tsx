import type { Meta, StoryObj } from "@storybook/react";
import { StripeCheckoutContainer } from "./StripeCheckout";

const meta = {
  component: StripeCheckoutContainer,
} satisfies Meta<typeof StripeCheckoutContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    price: {
      baseCostInCents: 1000,
      processingFeeInCents: 30,
      totalInCents: 1030,
    },
    stripe: null,
    elements: null,
    error: undefined,
    isLoading: false,
    isSubmitting: false,
    children: null,
    handleSubmit: async () => {},
  },
};

export const WithError: Story = {
  args: {
    price: {
      baseCostInCents: 1000,
      processingFeeInCents: 30,
      totalInCents: 1030,
    },
    stripe: null,
    elements: null,
    error: new Error("Payment processing failed. Please try again."),
    isLoading: false,
    isSubmitting: false,
    children: null,
    handleSubmit: async () => {},
  },
};
