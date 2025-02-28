import type { Meta, StoryObj } from "@storybook/react";
import { ThumbnailWallet } from "./wallet";

const meta: Meta<typeof ThumbnailWallet> = {
  title: "Modules/Thumbnails/Wallet",
  component: ThumbnailWallet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ThumbnailWallet>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="sm" />
        <ThumbnailWallet variant="faded" size="sm" />
        <ThumbnailWallet variant="default" size="sm" />
        <ThumbnailWallet variant="highlight" size="sm" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="md" />
        <ThumbnailWallet variant="faded" size="md" />
        <ThumbnailWallet variant="default" size="md" />
        <ThumbnailWallet variant="highlight" size="md" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="lg" />
        <ThumbnailWallet variant="faded" size="lg" />
        <ThumbnailWallet variant="default" size="lg" />
        <ThumbnailWallet variant="highlight" size="lg" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="xl" />
        <ThumbnailWallet variant="faded" size="xl" />
        <ThumbnailWallet variant="default" size="xl" />
        <ThumbnailWallet variant="highlight" size="xl" />
      </div>
    </div>
  ),
};

export const ArgentX: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="sm" brand="argentx" />
        <ThumbnailWallet variant="faded" size="sm" brand="argentx" />
        <ThumbnailWallet variant="default" size="sm" brand="argentx" />
        <ThumbnailWallet variant="highlight" size="sm" brand="argentx" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="md" brand="argentx" />
        <ThumbnailWallet variant="faded" size="md" brand="argentx" />
        <ThumbnailWallet variant="default" size="md" brand="argentx" />
        <ThumbnailWallet variant="highlight" size="md" brand="argentx" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="lg" brand="argentx" />
        <ThumbnailWallet variant="faded" size="lg" brand="argentx" />
        <ThumbnailWallet variant="default" size="lg" brand="argentx" />
        <ThumbnailWallet variant="highlight" size="lg" brand="argentx" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="xl" brand="argentx" />
        <ThumbnailWallet variant="faded" size="xl" brand="argentx" />
        <ThumbnailWallet variant="default" size="xl" brand="argentx" />
        <ThumbnailWallet variant="highlight" size="xl" brand="argentx" />
      </div>
    </div>
  ),
};

export const Braavos: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="sm" brand="braavos" />
        <ThumbnailWallet variant="faded" size="sm" brand="braavos" />
        <ThumbnailWallet variant="default" size="sm" brand="braavos" />
        <ThumbnailWallet variant="highlight" size="sm" brand="braavos" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="md" brand="braavos" />
        <ThumbnailWallet variant="faded" size="md" brand="braavos" />
        <ThumbnailWallet variant="default" size="md" brand="braavos" />
        <ThumbnailWallet variant="highlight" size="md" brand="braavos" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="lg" brand="braavos" />
        <ThumbnailWallet variant="faded" size="lg" brand="braavos" />
        <ThumbnailWallet variant="default" size="lg" brand="braavos" />
        <ThumbnailWallet variant="highlight" size="lg" brand="braavos" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="xl" brand="braavos" />
        <ThumbnailWallet variant="faded" size="xl" brand="braavos" />
        <ThumbnailWallet variant="default" size="xl" brand="braavos" />
        <ThumbnailWallet variant="highlight" size="xl" brand="braavos" />
      </div>
    </div>
  ),
};

export const OpenZeppelin: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="sm" brand="openzeppelin" />
        <ThumbnailWallet variant="faded" size="sm" brand="openzeppelin" />
        <ThumbnailWallet variant="default" size="sm" brand="openzeppelin" />
        <ThumbnailWallet variant="highlight" size="sm" brand="openzeppelin" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="md" brand="openzeppelin" />
        <ThumbnailWallet variant="faded" size="md" brand="openzeppelin" />
        <ThumbnailWallet variant="default" size="md" brand="openzeppelin" />
        <ThumbnailWallet variant="highlight" size="md" brand="openzeppelin" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="lg" brand="openzeppelin" />
        <ThumbnailWallet variant="faded" size="lg" brand="openzeppelin" />
        <ThumbnailWallet variant="default" size="lg" brand="openzeppelin" />
        <ThumbnailWallet variant="highlight" size="lg" brand="openzeppelin" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="xl" brand="openzeppelin" />
        <ThumbnailWallet variant="faded" size="xl" brand="openzeppelin" />
        <ThumbnailWallet variant="default" size="xl" brand="openzeppelin" />
        <ThumbnailWallet variant="highlight" size="xl" brand="openzeppelin" />
      </div>
    </div>
  ),
};

export const Controller: Story = {
  render: () => (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="sm" brand="controller" />
        <ThumbnailWallet variant="faded" size="sm" brand="controller" />
        <ThumbnailWallet variant="default" size="sm" brand="controller" />
        <ThumbnailWallet variant="highlight" size="sm" brand="controller" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="md" brand="controller" />
        <ThumbnailWallet variant="faded" size="md" brand="controller" />
        <ThumbnailWallet variant="default" size="md" brand="controller" />
        <ThumbnailWallet variant="highlight" size="md" brand="controller" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="lg" brand="controller" />
        <ThumbnailWallet variant="faded" size="lg" brand="controller" />
        <ThumbnailWallet variant="default" size="lg" brand="controller" />
        <ThumbnailWallet variant="highlight" size="lg" brand="controller" />
      </div>
      <div className="flex gap-3 ">
        <ThumbnailWallet variant="dark" size="xl" brand="controller" />
        <ThumbnailWallet variant="faded" size="xl" brand="controller" />
        <ThumbnailWallet variant="default" size="xl" brand="controller" />
        <ThumbnailWallet variant="highlight" size="xl" brand="controller" />
      </div>
    </div>
  ),
};
