import React, { PropsWithChildren, useState } from "react";
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
  CheckboxIcon,
  ArrowTurnDownIcon,
  Badge,
  SpaceInvaderIcon,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@cartridge/ui-next";
import { SessionSummary as SessionSummaryType } from "@cartridge/utils";
import { StarknetEnumType, StarknetMerkleType } from "starknet";
// import { useSessionSummary } from "@cartridge/utils";

export function SessionSummary({}: { policies: Policy[] }) {
  // const { controller } = useConnection()
  // const { data: summary } = useSessionSummary({ policies, provider: controller });

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(summary.default).map(([address, policies]) => (
        <Contract
          key={address}
          address={address}
          title="Contract"
          policies={policies}
        />
      ))}

      {Object.entries(summary.ERC20).map(([address, { policies, meta }]) => (
        <Contract
          key={address}
          address={address}
          title={meta.name}
          policies={policies}
          icon={<CardIcon src={meta.logoUrl} />}
        />
      ))}

      {Object.entries(summary.ERC721).map(([address, policies]) => (
        <Contract
          key={address}
          address={address}
          title="ERC-721"
          policies={policies}
          icon={
            <CardIcon>
              <SpaceInvaderIcon variant="line" />
            </CardIcon>
          }
        />
      ))}

      <SignMessages messages={summary.messages} />
    </div>
  );
}

function Contract({
  address,
  title,
  policies,
  icon = <CardIcon />,
}: {
  address: string;
  title: string;
  policies: CallPolicy[];
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader icon={icon}>
        <CardTitle className="text-foreground">{title}</CardTitle>
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
                {policies.length > 0 ? "s" : ""}
              </span>
            </AccordionTrigger>
          </CardContent>

          <AccordionContent>
            {policies.map((c) => (
              <CardContent key={c.method} className="flex items-center gap-1">
                <CircleIcon size="sm" className="text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div>{c.method}</div>

                  {c.description && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon
                            size="sm"
                            className="text-muted-foreground"
                          />
                        </TooltipTrigger>

                        <TooltipContent>{c.description}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardContent>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

function SignMessages({
  messages,
}: {
  messages: SessionSummaryType["messages"];
}) {
  return (
    <Card>
      <CardHeader
        icon={
          <CardIcon>
            <PencilIcon variant="line" />
          </CardIcon>
        }
      >
        <CardTitle className="text-foreground">Sign Messages</CardTitle>
      </CardHeader>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <CardContent>
            <AccordionTrigger>
              You are agreeing to sign messages in the following format
            </AccordionTrigger>
          </CardContent>

          <AccordionContent>
            {messages.map((m, i) => (
              <CardContent
                key={i}
                className="text-muted-foreground flex flex-col"
              >
                {Object.values(m.domain).filter((f) => typeof f !== "undefined")
                  .length && (
                  <CollapsibleRow key="domain" title="domain">
                    {m.domain.name && (
                      <ValueRow
                        values={[{ name: "name", value: m.domain.name }]}
                      />
                    )}
                    {m.domain.version && (
                      <ValueRow
                        values={[{ name: "version", value: m.domain.version }]}
                      />
                    )}
                    {m.domain.chainId && (
                      <ValueRow
                        values={[{ name: "chainId", value: m.domain.chainId }]}
                      />
                    )}
                    {m.domain.revision && (
                      <ValueRow
                        values={[
                          { name: "revision", value: m.domain.revision },
                        ]}
                      />
                    )}
                  </CollapsibleRow>
                )}

                <ValueRow
                  values={[{ name: "primaryType", value: m.primaryType }]}
                />

                <CollapsibleRow title="types">
                  {Object.entries(m.types).map(([name, types]) => (
                    <CollapsibleRow key={name} title={name}>
                      {types.map((t) => (
                        <ValueRow
                          key={t.name}
                          values={[
                            { name: "name", value: t.name },
                            { name: "type", value: t.type },
                            ...(["enum", "merkletree"].includes(t.name)
                              ? [
                                  {
                                    name: "contains",
                                    value: (
                                      t as StarknetEnumType | StarknetMerkleType
                                    ).contains,
                                  },
                                ]
                              : []),
                          ]}
                        />
                      ))}
                    </CollapsibleRow>
                  ))}
                </CollapsibleRow>
              </CardContent>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

function CollapsibleRow({
  title,
  children,
}: PropsWithChildren & { title: string }) {
  const [value, setValue] = useState("");
  console.log({ value });
  return (
    <Accordion type="single" collapsible value={value} onValueChange={setValue}>
      <AccordionItem value={title} className="flex flex-col">
        <AccordionTrigger hideIcon className="hover:bg-accent rounded-md">
          <div className="flex items-center gap-1 py-2">
            <CheckboxIcon variant={value ? "minus-line" : "plus-line"} />
            <div>{title}</div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="ml-5 flex flex-col">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function ValueRow({
  values,
}: {
  values: { name: string; value: string | number }[];
}) {
  return (
    <div className="flex items-center py-2">
      <ArrowTurnDownIcon />
      <div className="flex items-center gap-2">
        {values.map((f) => (
          <div className="flex items-center gap-1" key={f.name}>
            name: <Badge>{f.value}</Badge>
          </div>
        ))}
      </div>
    </div>
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
        description: "This is a description about method 1",
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
