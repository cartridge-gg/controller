import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CardIcon,
  PencilIcon,
} from "@cartridge/ui-next";
import { SessionSummary as SessionSummaryType } from "@cartridge/utils";
import { CollapsibleRow } from "./CollapsibleRow";
import { ArrowTurnDownIcon, Badge } from "@cartridge/ui-next";

interface SignMessagesProps {
  messages: SessionSummaryType["messages"];
}

export function SignMessages({ messages }: SignMessagesProps) {
  if (!messages || !messages.length) {
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
                {/* Domain section */}
                {Object.values(m.domain).filter((f) => typeof f !== "undefined")
                  .length > 0 && (
                  <CollapsibleRow key="domain" title="domain">
                    {m.domain.name && (
                      <ValueRow
                        values={[{ name: "name", value: m.domain.name }]}
                      />
                    )}
                    {/* ... other domain fields ... */}
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
                                    value: t.contains,
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

interface ValueRowProps {
  values: { name: string; value: string | number }[];
}

export function ValueRow({ values }: ValueRowProps) {
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
