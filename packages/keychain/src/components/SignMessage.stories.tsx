import type { Meta, StoryObj } from "@storybook/react";

import { SignMessageView } from "./SignMessage";

const meta = {
  component: SignMessageView,
} satisfies Meta<typeof SignMessageView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    typedData: {
      types: {
        StarknetDomain: [
          {
            name: "name",
            type: "shortstring",
          },
          {
            name: "version",
            type: "shortstring",
          },
          {
            name: "chainId",
            type: "shortstring",
          },
          {
            name: "revision",
            type: "shortstring",
          },
        ],
        Person: [
          {
            name: "name",
            type: "felt",
          },
          {
            name: "wallet",
            type: "felt",
          },
        ],
        Mail: [
          {
            name: "from",
            type: "Person",
          },
          {
            name: "to",
            type: "Person",
          },
          {
            name: "contents",
            type: "felt",
          },
        ],
      },
      primaryType: "Mail",
      domain: {
        name: "StarkNet Mail",
        version: "1",
        revision: "1",
        chainId: "SN_SEPOLIA",
      },
      message: {
        from: {
          name: "Cow",
          wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        },
        to: {
          name: "Bob",
          wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        },
        contents: "Hello, Bob!",
      },
    },
    onSign: () => {},
    onCancel: () => {},
  },
};

export const ShortStringTypes: Story = {
  args: {
    typedData: {
      types: {
        StarknetDomain: [
          { name: "name", type: "shortstring" },
          { name: "version", type: "shortstring" },
          { name: "chainId", type: "shortstring" },
          { name: "revision", type: "shortstring" },
        ],
        Person: [
          { name: "name", type: "felt" },
          { name: "wallet", type: "felt" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "felt" },
        ],
      },
      primaryType: "StarknetDomain",
      domain: {
        name: "StarkNet Mail",
        version: "1",
        revision: "1",
        chainId: "SN_SEPOLIA",
      },
      message: {
        name: "My DApp",
        version: "1.0",
        chainId: "SN_SEPOLIA",
        revision: "1",
      },
    },
    onSign: () => {},
    onCancel: () => {},
  },
};

export const FeltArrayType: Story = {
  args: {
    typedData: {
      types: {
        StarknetDomain: [
          { name: "name", type: "shortstring" },
          { name: "version", type: "shortstring" },
          { name: "chainId", type: "shortstring" },
          { name: "revision", type: "shortstring" },
        ],
        Document: [
          { name: "title", type: "felt" },
          { name: "segments", type: "felt*" }, // Array of felts
        ],
      },
      primaryType: "Document",
      domain: {
        name: "StarkNet Docs",
        version: "1",
        revision: "1",
        chainId: "SN_SEPOLIA",
      },
      message: {
        title: "0x546869732069732061207469746c65", // "This is a title"
        segments: [
          "0x48656c6c6f", // "Hello"
          "0x576f726c64", // "World"
          "0x46726f6d", // "From"
          "0x537461726b4e6574", // "StarkNet"
        ],
      },
    },
    onSign: () => console.log("Sign FeltArrayType"),
    onCancel: () => console.log("Cancel FeltArrayType"),
  },
};

export const VariousPrimitiveTypes: Story = {
  args: {
    typedData: {
      types: {
        StarknetDomain: [
          { name: "name", type: "shortstring" },
          { name: "version", type: "shortstring" },
          { name: "chainId", type: "shortstring" },
          { name: "revision", type: "shortstring" },
        ],
        TransactionDetails: [
          { name: "senderAddress", type: "ContractAddress" },
          { name: "isApproved", type: "bool" },
          { name: "maxFee", type: "u128" },
          { name: "classHash", type: "ClassHash" },
          { name: "selector", type: "selector" }, // StarkNet selectors are felts
          { name: "description", type: "string" }, // The new string type
        ],
      },
      primaryType: "TransactionDetails",
      domain: {
        name: "StarkNet Tx",
        version: "1",
        revision: "1",
        chainId: "SN_SEPOLIA",
      },
      message: {
        senderAddress:
          "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        isApproved: "0x1", // true (booleans are often represented as 0x0 or 0x1)
        maxFee: "0x2386f26fc10000", // A u128 value (e.g., 10^18)
        classHash:
          "0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789",
        selector:
          "0x02404d4c518588950507479123a8a431098e6979737976973b6815903d542d40", // Some selector
        description: "This is a modern StarkNet string example.",
      },
    },
    onSign: () => console.log("Sign VariousPrimitiveTypes"),
    onCancel: () => console.log("Cancel VariousPrimitiveTypes"),
  },
};

export const BooleanExamples: Story = {
  args: {
    typedData: {
      types: {
        StarknetDomain: [
          { name: "name", type: "shortstring" },
          { name: "version", type: "shortstring" },
          { name: "chainId", type: "shortstring" },
          { name: "revision", type: "shortstring" },
        ],
        BooleanTest: [
          { name: "nativeTrue", type: "bool" },
          { name: "nativeFalse", type: "bool" },
          { name: "intTrue", type: "bool" },
          { name: "hexFalse", type: "bool" },
          { name: "description", type: "felt" },
        ],
      },
      primaryType: "BooleanTest",
      domain: {
        name: "Boolean Test",
        version: "1",
        revision: "1",
        chainId: "SN_SEPOLIA",
      },
      message: {
        nativeTrue: true,
        nativeFalse: false,
        intTrue: "1", // Should display as "true"
        hexFalse: "0x0", // Should display as "false"
        description: "Testing different boolean representations",
      },
    },
    onSign: () => console.log("Sign BooleanExamples"),
    onCancel: () => console.log("Cancel BooleanExamples"),
  },
};
