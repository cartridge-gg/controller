import React, { PropsWithChildren, useEffect, useState } from "react";
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
  ExternalIcon,
  cn,
  Spinner,
  CoinsIcon,
  ErrorImage,
} from "@cartridge/ui-next";
import {
  formatAddress,
  isSlotChain,
  SessionSummary as SessionSummaryType,
  StarkscanUrl,
} from "@cartridge/utils";
import { constants, StarknetEnumType, StarknetMerkleType } from "starknet";
import Link from "next/link";
import { useConnection } from "hooks/connection";
import { useSessionSummary } from "@cartridge/utils";
import { ScrollIcon } from "@cartridge/ui";

export function SessionSummary({
  policies,
  setError,
}: {
  policies: Policy[];
  setError?: (error: Error) => void;
}) {
  const { controller } = useConnection();
  const {
    data: summary,
    error,
    isLoading,
  } = useSessionSummary({
    policies,
    provider: controller,
  });

  useEffect(() => {
    setError?.(error);
  }, [error, setError]);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center gap-8 p-8">
        <div className="text-sm text-semibold text-muted-foreground flex flex-col items-center text-center gap-3">
          <div>Oops! Something went wrong parsing session summary</div>
          <div>Please try it again.</div>
        </div>
        <ErrorImage />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(summary.dojo).map(([address, { policies, meta }]) => (
        <Contract
          key={address}
          address={address}
          title={meta.dojoName}
          policies={policies}
        />
      ))}

      {Object.entries(summary.default).map(([address, policies], i) => (
        <Contract
          key={address}
          address={address}
          title={`Contract ${i + 1}`}
          policies={policies}
          icon={
            <CardIcon>
              <ScrollIcon variant="line" />
            </CardIcon>
          }
        />
      ))}

      {Object.entries(summary.ERC20).map(([address, { policies, meta }]) => (
        <Contract
          key={address}
          address={address}
          title={`spend ${meta?.name ?? "ERC-20"} token`}
          policies={policies}
          icon={
            meta?.logoUrl ? (
              <CardIcon src={meta.logoUrl} />
            ) : (
              <CardIcon>
                <CoinsIcon variant="line" />
              </CardIcon>
            )
          }
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
  const { chainId } = useConnection();
  const isSlot = isSlotChain(chainId);

  return (
    <Card>
      <CardHeader icon={icon}>
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardHeaderRight>
          <Link
            href={StarkscanUrl(chainId as constants.StarknetChainId).contract(
              address,
            )}
            className={cn(
              "text-xs text-muted-foreground flex items-center gap-1 cursor-pointer",
              isSlot ? "pointer-events-none" : "",
            )}
            target="_blank"
            aria-disabled={isSlot}
            tabIndex={isSlot ? -1 : undefined}
          >
            {formatAddress(address, { size: "xs" })}

            <ExternalIcon size="xs" />
          </Link>
        </CardHeaderRight>
      </CardHeader>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <CardContent>
            <AccordionTrigger>
              You are agreeing to automate{" "}
              <span className="text-accent-foreground font-bold">
                {policies.length} {policies.length > 1 ? "methods" : "method"}
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
  if (!messages.length) {
    return null;
  }

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
              You are agreeing to sign{" "}
              <span className="text-accent-foreground font-bold">
                {messages.length} {messages.length > 1 ? "messages" : "message"}
              </span>{" "}
              in the following format
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
            {f.name}: <Badge>{f.value}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
