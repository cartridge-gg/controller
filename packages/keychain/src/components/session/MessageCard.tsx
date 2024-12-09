import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  CardIcon,
  PencilIcon,
  AccordionTrigger,
} from "@cartridge/ui-next";
import { ArrowTurnDownIcon, Badge } from "@cartridge/ui-next";
import { StarknetEnumType, StarknetMerkleType } from "@starknet-io/types-js";
import { SignMessagePolicy } from "@cartridge/presets";
import { Text } from "@chakra-ui/react";

import { CollapsibleRow } from "./CollapsibleRow";

interface MessageContentProps {
  message: SignMessagePolicy;
}

function MessageContent({ message: m }: MessageContentProps) {
  return (
    <CardContent className="text-muted-foreground flex flex-col">
      {/* Domain section */}
      {Object.values(m.domain).filter((f) => typeof f !== "undefined").length >
        0 && (
        <CollapsibleRow key="domain" title="domain">
          {m.domain.name && (
            <ValueRow values={[{ name: "name", value: m.domain.name }]} />
          )}
          {/* ... other domain fields ... */}
        </CollapsibleRow>
      )}

      <ValueRow values={[{ name: "primaryType", value: m.primaryType }]} />

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
                          value: (t as StarknetEnumType | StarknetMerkleType)
                            .contains,
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
  );
}

interface MessageCardProps {
  message: SignMessagePolicy;
}

export function MessageCard({ message }: MessageCardProps) {
  return (
    <Card>
      <CardHeader
        icon={
          <CardIcon>
            <PencilIcon variant="solid" />
          </CardIcon>
        }
      >
        <CardTitle className="text-foreground">Sign Message</CardTitle>
      </CardHeader>

      <Accordion type="single" defaultValue="message" collapsible>
        <AccordionItem value="message">
          <CardContent>
            <AccordionTrigger>
              <Text color="text.secondary" fontSize="xs">
                The application will be able to sign the following message on
                your behalf
              </Text>
            </AccordionTrigger>
          </CardContent>

          <AccordionContent>
            <MessageContent message={message} />
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
