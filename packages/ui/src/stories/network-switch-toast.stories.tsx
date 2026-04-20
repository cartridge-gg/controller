import type { Meta, StoryObj } from "@storybook/react";
import { NetworkSwitchToast } from "@/components/primitives/toast/specialized-toasts";
import { StarknetIcon } from "@/components/icons/brand";

const meta: Meta<typeof NetworkSwitchToast> = {
  title: "Primitives/Toast/Network Switch Toast",
  component: NetworkSwitchToast,
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
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    networkName: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof NetworkSwitchToast>;

export const StarknetMainnet: Story = {
  args: {
    networkName: "Starknet Mainnet",
    networkIcon: <StarknetIcon size="default" />,
  },
};

export const NumsChain: Story = {
  args: {
    networkName: "Nums Chain",
    networkIcon: (
      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
        N
      </div>
    ),
  },
};

export const EthereumMainnet: Story = {
  args: {
    networkName: "Ethereum Mainnet",
    networkIcon: (
      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
        E
      </div>
    ),
  },
};

export const CustomNetwork: Story = {
  args: {
    networkName: "Custom Network",
    networkIcon: (
      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
        C
      </div>
    ),
  },
};
