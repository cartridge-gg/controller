import type { Meta, StoryObj } from "@storybook/react";
import { SignerCard } from "./signer-card";

const meta = {
  title: "components/settings/Signer Card",
  component: SignerCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    signer: {
      __typename: "Eip191Credentials",
      eip191: [
        {
          __typename: "Eip191Credential",
          ethAddress: "0x123",
          provider: "metamask",
        },
      ],
    },
    isOriginalSigner: true,
  },
} satisfies Meta<typeof SignerCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
