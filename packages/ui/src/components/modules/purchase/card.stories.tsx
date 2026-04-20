import type { Meta, StoryObj } from "@storybook/react";
import { PurchaseCard } from "./card";
import {
  ControllerColorIcon,
  CreditCardIcon,
  StarknetColorIcon,
  GoogleColorIcon,
  PhantomColorIcon,
  ArgentColorIcon,
  SolanaIcon,
  StarknetIcon,
  RabbyColorIcon,
  EthereumIcon,
} from "@/components/icons";
import { ControllerStack } from "@/utils/mock/controller-stack";

const meta = {
  title: "Modules/Purchase/Card",
  component: PurchaseCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    text: {
      description: "Payment method text",
      control: { type: "text" },
    },
    icon: {
      description: "Payment method icon",
      control: { type: "object" },
    },
    network: {
      description: "Network text",
      control: { type: "text" },
    },
    networkIcon: {
      description: "Network icon",
      control: { type: "object" },
    },
  },
} satisfies Meta<typeof PurchaseCard>;

export default meta;
type Story = StoryObj<typeof PurchaseCard>;

export const Default: Story = {
  render: () => (
    <ControllerStack>
      <PurchaseCard
        text="Controller"
        icon={<ControllerColorIcon />}
        onClick={() => {}}
      />
      <PurchaseCard
        text="Credit Card"
        icon={<CreditCardIcon variant="solid" />}
        onClick={() => {}}
      />
      <PurchaseCard
        text="Starknet"
        icon={<StarknetColorIcon />}
        onClick={() => {}}
      />
      <PurchaseCard
        text="Google"
        icon={<GoogleColorIcon />}
        onClick={() => {}}
      />
      <PurchaseCard
        text="Phantom"
        icon={<PhantomColorIcon />}
        network="Solana"
        networkIcon={<SolanaIcon />}
        onClick={() => {}}
      />
      <PurchaseCard
        text="Argent"
        icon={<ArgentColorIcon />}
        network="Starknet"
        networkIcon={<StarknetIcon />}
        onClick={() => {}}
      />
      <PurchaseCard
        text="Rabby"
        icon={<RabbyColorIcon />}
        network="Ethereum"
        networkIcon={<EthereumIcon />}
        onClick={() => {}}
      />
    </ControllerStack>
  ),
};

export const Controller: Story = {
  args: {
    text: "Controller",
    icon: <ControllerColorIcon />,
  },
};

export const CreditCard: Story = {
  args: {
    text: "Credit Card",
    icon: <CreditCardIcon variant="solid" />,
  },
};

export const Starknet: Story = {
  args: {
    text: "Starknet",
    icon: <StarknetColorIcon />,
  },
};

export const Google: Story = {
  args: {
    text: "Google",
    icon: <GoogleColorIcon />,
  },
};

export const PhantomWallet: Story = {
  args: {
    text: "Phantom",
    icon: <PhantomColorIcon />,
    network: "Solana",
    networkIcon: <SolanaIcon />,
  },
};

export const ReadyWallet: Story = {
  args: {
    text: "Ready",
    icon: <ArgentColorIcon />,
    network: "Starknet",
    networkIcon: <StarknetIcon />,
  },
};

export const RabbyWallet: Story = {
  args: {
    text: "Rabby",
    icon: <RabbyColorIcon />,
    network: "Ethereum",
    networkIcon: <EthereumIcon />,
  },
};
