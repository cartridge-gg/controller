import type { Meta, StoryObj } from "@storybook/react";
import { PurchaseSuccessInner } from "./success";
import {
  CreditIcon,
  CoinsIcon,
  EthereumIcon,
  StarknetIcon,
} from "@cartridge/ui";
import { ItemType } from "@/context/purchase";
import { StarterpackAcquisitionType } from "@cartridge/ui/utils/api/cartridge";

const meta = {
  component: PurchaseSuccessInner,
} satisfies Meta<typeof PurchaseSuccessInner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Credits: Story = {
  args: {
    acquisitionType: StarterpackAcquisitionType.Paid,
    items: [
      {
        title: "Credits",
        icon: <CreditIcon />,
        value: 1000,
        type: ItemType.CREDIT,
      },
    ],
  },
};

export const NFT: Story = {
  args: {
    acquisitionType: StarterpackAcquisitionType.Paid,
    items: [
      {
        title: "Village pass",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: ItemType.NFT,
      },
    ],
  },
};

export const TokenPurchase: Story = {
  args: {
    acquisitionType: StarterpackAcquisitionType.Paid,
    items: [
      {
        title: "USDC",
        subtitle: "100 USDC tokens",
        icon: <CoinsIcon variant="line" />,
        value: 100,
        type: ItemType.ERC20,
      },
      {
        title: "ETH",
        subtitle: "0.5 Ethereum",
        icon: <EthereumIcon />,
        value: 0.5,
        type: ItemType.ERC20,
      },
    ],
  },
};

export const MixedPurchase: Story = {
  args: {
    acquisitionType: StarterpackAcquisitionType.Paid,
    items: [
      {
        title: "Credits",
        icon: <CreditIcon />,
        value: 2000,
        type: ItemType.CREDIT,
      },
      {
        title: "STRK",
        subtitle: "1000 Starknet tokens",
        icon: <StarknetIcon />,
        value: 1000,
        type: ItemType.ERC20,
      },
      {
        title: "Rare Artifact",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: ItemType.NFT,
      },
    ],
  },
};

export const ClaimedItems: Story = {
  args: {
    acquisitionType: StarterpackAcquisitionType.Claimed,
    items: [
      {
        title: "Credits",
        icon: <CreditIcon />,
        value: 500,
        type: ItemType.CREDIT,
      },
      {
        title: "LORDS",
        subtitle: "50 LORDS gaming tokens",
        icon: <CoinsIcon variant="line" />,
        value: 50,
        type: ItemType.ERC20,
      },
      {
        title: "Welcome NFT",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: ItemType.NFT,
      },
    ],
  },
};
