import { Policy } from "@cartridge/controller";
import { Card, CardHeader, CardTitle } from "@cartridge/ui-next";
// import { useTransactionSummary } from "@cartridge/utils";

export function TransactionDetails({ policies }: { policies: Policy[] }) {
  // const { controller } = useConnection()
  // const { data: summary } = useTransactionSummary({ policies, provider: controller });
  // console.log({ policies, summary })
  return (
    <div>
      {Object.entries(summary.default).map(([addr, calls]) => (
        <Card key={addr}>
          <CardHeader>
            <CardTitle>Contract: {addr}</CardTitle>
          </CardHeader>
        </Card>
      ))}

      {Object.entries(summary.ERC20).map(([addr, calls]) => (
        <Card key={addr}>
          <CardHeader>
            <CardTitle>Contract: {addr}</CardTitle>
          </CardHeader>
        </Card>
      ))}

      {Object.entries(summary.ERC721).map(([addr, calls]) => (
        <Card key={addr}>
          <CardHeader>
            <CardTitle>Contract: {addr}</CardTitle>
          </CardHeader>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Sign Messages</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

const summary = {
  default: {
    "0x000000000000000000000000000000000000000000000000000000000000000": [
      {
        target:
          "0x000000000000000000000000000000000000000000000000000000000000000",
        method: "method 1",
      },
      {
        target:
          "0x000000000000000000000000000000000000000000000000000000000000000",
        method: "method 2",
      },
    ],
  },
  ERC20: {
    "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": [
      {
        target:
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        method: "approve",
      },
      {
        target:
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        method: "transfer",
      },
    ],
  },
  ERC721: {
    "0x000000000000000000000000000000000000000000000000000000000000000": [
      {
        target:
          "0x000000000000000000000000000000000000000000000000000000000000000",
        method: "approve",
      },
      {
        target:
          "0x000000000000000000000000000000000000000000000000000000000000000",
        method: "transfer",
      },
    ],
  },
  messages: [
    {
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
      primaryType: "Mail",
      domain: {
        name: "StarkNet Mail",
        version: "1",
        revision: "1",
        chainId: "SN_SEPOLIA",
      },
    },
  ],
};
