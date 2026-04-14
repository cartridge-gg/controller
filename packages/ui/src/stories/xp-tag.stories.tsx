import type { Meta, StoryObj } from "@storybook/react";
import { XPTag } from "@/components/primitives/toast/specialized-toasts";

const meta: Meta<typeof XPTag> = {
  title: "Primitives/Toast/Supporting/XP Tag",
  component: XPTag,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#353535" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
  argTypes: {
    amount: { control: "number" },
    isMainnet: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof XPTag>;

export const MainnetXP: Story = {
  args: {
    amount: 100,
    isMainnet: true,
  },
};

export const TestnetXP: Story = {
  args: {
    amount: 100,
    isMainnet: false,
  },
};

export const LargeAmount: Story = {
  args: {
    amount: 1500,
    isMainnet: true,
  },
};

export const SmallAmount: Story = {
  args: {
    amount: 25,
    isMainnet: false,
  },
};

export const Comparison: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-white text-sm font-semibold mb-2">
          Mainnet vs Testnet
        </h3>
        <div className="flex gap-4 items-center">
          <div className="text-center">
            <XPTag amount={100} isMainnet={true} />
            <p className="text-white text-xs mt-1">Mainnet</p>
          </div>
          <div className="text-center">
            <XPTag amount={100} isMainnet={false} />
            <p className="text-white text-xs mt-1">Testnet</p>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-white text-sm font-semibold mb-2">
          Different Amounts
        </h3>
        <div className="flex gap-4 items-center">
          <XPTag amount={25} isMainnet={true} />
          <XPTag amount={100} isMainnet={true} />
          <XPTag amount={250} isMainnet={true} />
          <XPTag amount={1000} isMainnet={true} />
        </div>
      </div>
    </div>
  ),
};
