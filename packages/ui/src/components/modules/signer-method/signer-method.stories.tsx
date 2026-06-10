import type { Meta, StoryObj } from "@storybook/react";
import { SignerMethod } from "./signer-method";
import { ControllerStack } from "@/utils/mock/controller-stack";
import { toast } from "sonner";

const meta: Meta<typeof SignerMethod> = {
  title: "Modules/SignerMethod",
  component: SignerMethod,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    kind: {
      control: { type: "select" },
      options: [
        "google",
        "sms",
        "discord",
        "passkey",
        "webauthn",
        "password",
        "wallet",
        "metamask",
        "argent",
        "braavos",
        "base",
        "rabby",
        "phantom",
        "phantom-evm",
        "walletconnect",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const handleClidk = () => {
      toast.success(`clicked!`);
    };
    return (
      <ControllerStack>
        <SignerMethod kind="google" onClick={handleClidk} />
        <SignerMethod kind="sms" onClick={handleClidk} />
        <SignerMethod kind="sms" onClick={handleClidk} existing />
        <SignerMethod kind="discord" onClick={handleClidk} />
        <SignerMethod kind="passkey" onClick={handleClidk} />
        <SignerMethod kind="webauthn" onClick={handleClidk} />
        <SignerMethod kind="password" onClick={handleClidk} />
        <SignerMethod kind="wallet" onClick={handleClidk} />
        <SignerMethod kind="metamask" onClick={handleClidk} />
        <SignerMethod kind="argent" onClick={handleClidk} />
        <SignerMethod kind="braavos" onClick={handleClidk} />
        <SignerMethod kind="base" onClick={handleClidk} />
        <SignerMethod kind="rabby" onClick={handleClidk} />
        <SignerMethod kind="phantom" onClick={handleClidk} />
        <SignerMethod kind="phantom-evm" onClick={handleClidk} />
        <SignerMethod kind="walletconnect" onClick={handleClidk} />
      </ControllerStack>
    );
  },
};
