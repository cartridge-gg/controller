import type { SignMessagePolicy } from "@cartridge/presets";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CheckboxIcon,
  PencilIcon,
  Switch,
} from "@cartridge/ui-next";
import { ArrowTurnDownIcon, Badge } from "@cartridge/ui-next";
import type {
  StarknetEnumType,
  StarknetMerkleType,
} from "@starknet-io/types-js";
import { type PropsWithChildren, useState } from "react";
import { AccordionCard } from "./AccordionCard";

interface MessageCardProps {
  messages: SignMessagePolicy[];
  isExpanded?: boolean;
}

export function MessageCard({ messages, isExpanded }: MessageCardProps) {
  return (
    <AccordionCard
      icon={<PencilIcon variant="solid" />}
      title="Sign Message"
      trigger={
        <div className="text-xs text-muted-foreground">
          Approve&nbsp;
          <span className="text-accent-foreground font-bold">
            {messages.length} {messages.length > 1 ? `messages` : "message"}
          </span>
        </div>
      }
      isExpanded={isExpanded}
    >
      <MessageContent messages={messages} />
    </AccordionCard>
  );
}

export function MessageContent({
  messages,
}: {
  messages: SignMessagePolicy[];
}) {
  return (
    <>
      {messages.map((m, i) => (
        <div
          key={`${m.domain.name}-${i}`}
          className="flex flex-col bg-background-100 gap-2 text-xs"
        >
          <div className="flex flex-row items-center justify-between">
            <div className="py-2 font-bold">{m.name ?? `Message ${i + 1}`}</div>
            <Switch />
          </div>

          <div className="flex flex-col gap-px rounded overflow-auto border border-background p-3">
            {/* Domain section */}
            {Object.values(m.domain).filter((f) => typeof f !== "undefined")
              .length > 0 && (
              <CollapsibleRow key="domain" title="domain">
                {m.domain.name && (
                  <ValueRow values={[{ name: "name", value: m.domain.name }]} />
                )}
              </CollapsibleRow>
            )}

            <ValueRow
              values={[{ name: "primaryType", value: m.primaryType }]}
            />

            <CollapsibleRow title="types">
              {Object.entries(m.types).map(([name, types]) => (
                <CollapsibleRow key={name} title={name}>
                  {types.map((t, typeIndex) => (
                    <ValueRow
                      key={`${t.name}-${typeIndex}`}
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
    </>
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
            <div className="text-xs">{title}</div>
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
    <div className="flex items-center py-1 gap-1 text-muted-foreground">
      <ArrowTurnDownIcon size="sm" />
      <div className="flex items-center gap-2">
        {values.map((f) => (
          <div className="flex items-center gap-1 text-xs" key={f.name}>
            {f.name}: <Badge className="bg-background-200">{f.value}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
