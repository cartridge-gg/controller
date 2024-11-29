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
    "0x0000000000000": [
      { target: "0x0000000000000", method: "method 1" },
      { target: "0x0000000000000", method: "method 2" },
    ],
  },
  ERC20: {
    "0x0000000000000": [
      { target: "0x0000000000000", method: "approve" },
      { target: "0x0000000000000", method: "transfer" },
    ],
  },
  ERC721: {
    "0x0000000000000": [
      { target: "0x0000000000000", method: "approve" },
      { target: "0x0000000000000", method: "transfer" },
    ],
  },
  messages: [],
};
