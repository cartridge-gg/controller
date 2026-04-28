import type { Meta, StoryObj } from "@storybook/react";
import { SignerMethod } from "./signer-method";
import { ControllerStack } from "@/utils/mock/controller-stack";

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
  render: () => (
    <ControllerStack>
      <SignerMethod kind="google" onClick={() => {}} />
      <SignerMethod kind="sms" onClick={() => {}} />
      <SignerMethod kind="discord" onClick={() => {}} />
      <SignerMethod kind="passkey" onClick={() => {}} />
      <SignerMethod kind="webauthn" onClick={() => {}} />
      <SignerMethod kind="password" onClick={() => {}} />
      <SignerMethod kind="wallet" onClick={() => {}} />
      <SignerMethod kind="metamask" onClick={() => {}} />
      <SignerMethod kind="argent" onClick={() => {}} />
      <SignerMethod kind="braavos" onClick={() => {}} />
      <SignerMethod kind="base" onClick={() => {}} />
      <SignerMethod kind="rabby" onClick={() => {}} />
      <SignerMethod kind="phantom" onClick={() => {}} />
      <SignerMethod kind="phantom-evm" onClick={() => {}} />
      <SignerMethod kind="walletconnect" onClick={() => {}} />
    </ControllerStack>
  ),
};
