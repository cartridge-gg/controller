import type { Meta, StoryObj } from "@storybook/react";
import { WalletType } from "@/components";
import { fn } from "@storybook/test";
import { Recipient } from "./recipient";

const meta: Meta<typeof Recipient> = {
  title: "Modules/Recipient",
  component: Recipient,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    to: "",
    value: "",
    selectedName: "",
    selectedAddress: "",
    selectedWallet: WalletType.None,
    resultName: "",
    resultAddress: "",
    resultWallet: WalletType.None,
    isFocused: false,
    isHovered: false,
    isLoading: false,
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onClear: fn(),
    onResultClick: fn(),
    onResultEnter: fn(),
    onResultLeave: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof Recipient>;

export const Default: Story = {};

export const Error: Story = {
  args: {
    value: "shnobiw.stark",
    error: { name: "error", message: "Could not get address from stark name" },
  },
};

export const ControllerValidated: Story = {
  args: {
    value: "shinobi",
    resultName: "shinobi.ctrl.stark",
    resultAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    resultWallet: WalletType.Controller,
    isFocused: true,
  },
};

export const ControllerConfirmed: Story = {
  args: {
    value: "clicksave.ctrl.stark",
    selectedName: "clicksave",
    selectedAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    selectedWallet: WalletType.Controller,
  },
};

export const ArgentValidated: Story = {
  args: {
    value: "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    resultName: "clicksave.stark",
    resultAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    resultWallet: WalletType.ArgentX,
    isFocused: true,
  },
};

export const ArgentConfirmed: Story = {
  args: {
    value: "clicksave.stark",
    selectedName: "clicksave",
    selectedAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    selectedWallet: WalletType.ArgentX,
  },
};

export const BraavosPreview: Story = {
  args: {
    resultAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    resultWallet: WalletType.Braavos,
    isFocused: true,
    isHovered: false,
    isLoading: false,
  },
};

export const ArgentPreview: Story = {
  args: {
    resultName: "clicksave.stark",
    resultAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    resultWallet: WalletType.ArgentX,
    isFocused: true,
    isHovered: false,
    isLoading: false,
  },
};

export const OpenZeppelinPreview: Story = {
  args: {
    resultAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    resultWallet: WalletType.OpenZeppelin,
    isFocused: true,
    isHovered: false,
    isLoading: false,
  },
};

export const WalletPreview: Story = {
  args: {
    resultAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    resultWallet: WalletType.None,
    isFocused: true,
    isHovered: false,
    isLoading: false,
  },
};

export const ControllerPreview: Story = {
  args: {
    resultName: "shinobi.ctrl.stark",
    resultAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    resultWallet: WalletType.Controller,
    isFocused: true,
    isHovered: false,
    isLoading: false,
  },
};

export const ControllerNamedSelection: Story = {
  args: {
    selectedName: "clicksave",
    selectedAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    selectedWallet: WalletType.Controller,
  },
};

export const ArgentNamedSelection: Story = {
  args: {
    selectedName: "clicksave.stark",
    selectedAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    selectedWallet: WalletType.ArgentX,
  },
};

export const BraavosNamedSelection: Story = {
  args: {
    selectedName: "clicksave.stark",
    selectedAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    selectedWallet: WalletType.Braavos,
  },
};

export const WalletNamedSelection: Story = {
  args: {
    selectedName: "clicksave.stark",
    selectedAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    selectedWallet: WalletType.None,
  },
};

export const OpenzeppelinNamedSelection: Story = {
  args: {
    selectedName: "clicksave.stark",
    selectedAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    selectedWallet: WalletType.OpenZeppelin,
  },
};

export const ArgentUnamedSelection: Story = {
  args: {
    selectedAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    selectedWallet: WalletType.ArgentX,
  },
};

export const BraavosUnamedSelection: Story = {
  args: {
    selectedAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    selectedWallet: WalletType.Braavos,
  },
};

export const WalletUnamedSelection: Story = {
  args: {
    selectedAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    selectedWallet: WalletType.None,
  },
};

export const OpenzeppelinUnamedSelection: Story = {
  args: {
    selectedAddress:
      "0x040eef43f4d7b9cc357312a83365c3649273886c5394efafdcc9144bd6b86424",
    selectedWallet: WalletType.OpenZeppelin,
  },
};
