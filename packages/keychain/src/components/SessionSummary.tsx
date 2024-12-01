import React from "react";
import { CallPolicy, Policy } from "@cartridge/controller";
import {
  Card,
  CardContent,
  CardHeader,
  CardHeaderRight,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CircleIcon,
  InfoIcon,
  CopyAddress,
  CardIcon,
  PencilIcon,
  ScrollIcon,
} from "@cartridge/ui-next";
import { SessionSummary as SessionSummaryType } from "@cartridge/utils";
// import { useSessionSummary } from "@cartridge/utils";

export function SessionSummary({}: { policies: Policy[] }) {
  // const { controller } = useConnection()
  // const { data: summary } = useSessionSummary({ policies, provider: controller });

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(summary.default).map(([address, policies]) => (
        <Contract key={address} address={address} policies={policies} />
      ))}

      {Object.entries(summary.ERC20).map(([address, { policies, meta }]) => (
        <Contract
          key={address}
          address={address}
          policies={policies}
          icon={<CardIcon src={meta.logoUrl} />}
        />
      ))}

      {Object.entries(summary.ERC721).map(([address, policies]) => (
        <Contract
          key={address}
          address={address}
          policies={policies}
          icon={
            <CardIcon>
              <ScrollIcon variant="line" />
            </CardIcon>
          }
        />
      ))}

      <Card>
        <CardHeader
          icon={
            <CardIcon>
              <PencilIcon variant="line" />
            </CardIcon>
          }
        >
          <CardTitle>Sign Messages</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

function Contract({
  address,
  policies,
  icon = <CardIcon />,
}: {
  address: string;
  policies: CallPolicy[];
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader icon={icon}>
        <CardTitle className="text-foreground">Contract</CardTitle>
        <CardHeaderRight>
          <CopyAddress address={address} size="xs" />
        </CardHeaderRight>
      </CardHeader>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <CardContent>
            <AccordionTrigger>
              You are agreeing to automate{" "}
              <span className="text-accent-foreground font-bold">
                {policies.length} method
                {policies.length > 1 ? "s" : ""}
              </span>
            </AccordionTrigger>
          </CardContent>

          <AccordionContent>
            {policies.map((c) => (
              <CardContent key={c.method} className="flex items-center gap-1">
                <CircleIcon size="sm" className="text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div>{c.method}</div>
                  <InfoIcon size="sm" className="text-muted-foreground" />
                </div>
              </CardContent>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

const summary: SessionSummaryType = {
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
    "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": {
      meta: {
        symbol: "ETH",
        address:
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        name: "Ether",
        decimals: 18,
        logoUrl:
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/c8a721d1-07c3-46e4-ab4e-523977c30b00/logo",
      },
      policies: [
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
