import type { Meta, StoryObj } from "@storybook/react";
import { SignerPendingCard } from "./signer-pending-card";
import { SignerMethodKind } from "../signer-method";

const meta: Meta<typeof SignerPendingCard> = {
  title: "Modules/SignerPendingCard",
  component: SignerPendingCard,
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
    <div className="space-y-4 grid grid-cols-3 gap-2">
      <SignerPendingCard kind="google" inProgress={true} />
      <SignerPendingCard
        kind="google"
        inProgress={false}
        error="Error connecting to Google"
      />
      <SignerPendingCard kind="google" inProgress={false} />

      {/* <SignerPendingCard kind="sms" inProgress={true} /> */}
      {/* <SignerPendingCard kind="sms" inProgress={false} error="Error connecting to SMS" /> */}
      <SignerPendingCard kind="sms" inProgress={false} />
      <SignerPendingCard kind="sms" inProgress={false} />
      <SignerPendingCard kind="sms" inProgress={false} />

      <SignerPendingCard kind="discord" inProgress={true} />
      <SignerPendingCard
        kind="discord"
        inProgress={false}
        error="Error connecting to Discord"
      />
      <SignerPendingCard kind="discord" inProgress={false} />

      <SignerPendingCard kind="passkey" inProgress={true} />
      <SignerPendingCard
        kind="passkey"
        inProgress={false}
        error="Error connecting to Passkey"
      />
      <SignerPendingCard kind="passkey" inProgress={false} />

      <SignerPendingCard kind="webauthn" inProgress={true} />
      <SignerPendingCard
        kind="webauthn"
        inProgress={false}
        error="Error connecting to WebAuthn"
      />
      <SignerPendingCard kind="webauthn" inProgress={false} />

      <SignerPendingCard kind="password" inProgress={true} />
      <SignerPendingCard
        kind="password"
        inProgress={false}
        error="Error connecting to Password"
      />
      <SignerPendingCard kind="password" inProgress={false} />

      <SignerPendingCard kind="wallet" inProgress={true} />
      <SignerPendingCard
        kind="wallet"
        inProgress={false}
        error="Error connecting to Wallet"
      />
      <SignerPendingCard
        kind="wallet"
        inProgress={false}
        authedAddress="0x1234567890123456789012345678901234567890"
      />

      <SignerPendingCard kind="metamask" inProgress={true} />
      <SignerPendingCard
        kind="metamask"
        inProgress={false}
        error="Error connecting to Metamask"
      />
      <SignerPendingCard
        kind="metamask"
        inProgress={false}
        authedAddress="0x1234567890123456789012345678901234567890"
      />

      <SignerPendingCard kind="argent" inProgress={true} />
      <SignerPendingCard
        kind="argent"
        inProgress={false}
        error="Error connecting to Argent"
      />
      <SignerPendingCard
        kind="argent"
        inProgress={false}
        authedAddress="0x1234567890123456789012345678901234567890"
      />

      <SignerPendingCard kind="braavos" inProgress={true} />
      <SignerPendingCard
        kind="braavos"
        inProgress={false}
        error="Error connecting to Braavos"
      />
      <SignerPendingCard
        kind="braavos"
        inProgress={false}
        authedAddress="0x1234567890123456789012345678901234567890"
      />

      <SignerPendingCard kind="base" inProgress={true} />
      <SignerPendingCard
        kind="base"
        inProgress={false}
        error="Error connecting to Base"
      />
      <SignerPendingCard
        kind="base"
        inProgress={false}
        authedAddress="0x1234567890123456789012345678901234567890"
      />

      <SignerPendingCard kind="rabby" inProgress={true} />
      <SignerPendingCard
        kind="rabby"
        inProgress={false}
        error="Error connecting to Rabby"
      />
      <SignerPendingCard
        kind="rabby"
        inProgress={false}
        authedAddress="0x1234567890123456789012345678901234567890"
      />

      <SignerPendingCard kind="phantom" inProgress={true} />
      <SignerPendingCard
        kind="phantom"
        inProgress={false}
        error="Error connecting to Phantom"
      />
      <SignerPendingCard
        kind="phantom"
        inProgress={false}
        authedAddress="0x1234567890123456789012345678901234567890"
      />

      <SignerPendingCard kind="phantom-evm" inProgress={true} />
      <SignerPendingCard
        kind="phantom-evm"
        inProgress={false}
        error="Error connecting to Phantom EVM"
      />
      <SignerPendingCard
        kind="phantom-evm"
        inProgress={false}
        authedAddress="0x1234567890123456789012345678901234567890"
      />

      <SignerPendingCard kind="walletconnect" inProgress={true} />
      <SignerPendingCard
        kind="walletconnect"
        inProgress={false}
        error="Error connecting to WalletConnect"
      />
      <SignerPendingCard
        kind="walletconnect"
        inProgress={false}
        authedAddress="0x1234567890123456789012345678901234567890"
      />

      <SignerPendingCard kind={"abc" as SignerMethodKind} inProgress={true} />
      <SignerPendingCard
        kind={"abc" as SignerMethodKind}
        inProgress={false}
        error="Error connecting to ??"
      />
      <SignerPendingCard kind={"abc" as SignerMethodKind} inProgress={false} />
    </div>
  ),
};
