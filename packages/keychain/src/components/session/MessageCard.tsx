import { PropsWithChildren, useState } from "react";
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
  CheckboxIcon,
} from "@cartridge/ui-next";
import { ArrowTurnDownIcon, Badge } from "@cartridge/ui-next";
import { StarknetEnumType, StarknetMerkleType } from "@starknet-io/types-js";
import { SignMessagePolicy } from "@cartridge/presets";

interface MessageCardProps {
  messages: SignMessagePolicy[];
}

export function MessageCard({ messages }: MessageCardProps) {
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

      <CardContent>
        <MessageContent messages={messages} />
      </CardContent>
    </Card>
  );
}

interface MessageContentProps {
  messages: SignMessagePolicy[];
}

function MessageContent({ messages }: MessageContentProps) {
  return (
    <Accordion type="single" defaultValue="message" collapsible>
      <AccordionItem value="message" className="flex flex-col gap-3">
        <AccordionTrigger
          className="text-xs text-muted-foreground"
          color="text.secondary"
        >
          Approve{" "}
          <span className="text-accent-foreground font-bold">
            {messages.length} {messages.length > 1 ? "messages" : "message"}
          </span>
        </AccordionTrigger>

        <AccordionContent className="text-xs flex flex-col bg-background border border-background rounded-md gap-px">
          {messages.map((m, i) => (
            <div
              key={m.domain.name ?? i}
              className="flex flex-col bg-secondary gap-4 p-3 first:rounded-t-md last:rounded-b-md"
            >
              <div className="font-bold">{m.name ?? `Message ${i + 1}`}</div>
              <div className="flex flex-col bg-secondary gap-1 ">
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
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
interface CollapsibleRowProps extends PropsWithChildren {
  title: string;
}

export function CollapsibleRow({ title, children }: CollapsibleRowProps) {
  const [value, setValue] = useState("");

  return (
    <Accordion type="single" collapsible value={value} onValueChange={setValue}>
      <AccordionItem value={title} className="flex flex-col">
        <AccordionTrigger hideIcon className="hover:bg-accent rounded-md">
          <div className="flex items-center gap-1 py-1">
            <CheckboxIcon
              variant={value ? "minus-line" : "plus-line"}
              size="sm"
            />
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

interface ValueRowProps {
  values: { name: string; value: string | number }[];
}

export function ValueRow({ values }: ValueRowProps) {
  return (
    <div className="flex items-center py-1">
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
