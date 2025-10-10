import { useCreateSession } from "@/hooks/session";
import type { SignMessagePolicy } from "@cartridge/presets";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CheckboxIcon,
  PencilIcon,
  Switch,
  Thumbnail,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { ArrowTurnDownIcon, Badge } from "@cartridge/ui";
import type {
  StarknetEnumType,
  StarknetMerkleType,
} from "@starknet-io/types-js";
import { type PropsWithChildren, useState, useEffect } from "react";

interface MessageCardProps {
  messages: SignMessagePolicyWithEnabled[];
  isExpanded?: boolean;
  className?: string;
}

export function MessageCard({
  messages,
  isExpanded = false,
  className,
}: MessageCardProps) {
  const [isOpened, setisOpened] = useState(isExpanded);
  const { isEditable } = useCreateSession();

  // Auto-open accordion when isEditable becomes true
  useEffect(() => {
    if (isEditable) {
      setisOpened(true);
    }
  }, [isEditable]);

  return (
    <Accordion
      type="single"
      collapsible
      className={cn("bg-background-200 rounded", className)}
      value={isOpened ? "item" : ""}
      onValueChange={(value) => setisOpened(value === "item")}
    >
      <AccordionItem value="item">
        <AccordionTrigger
          parentClassName="h-11 p-3"
          className="flex items-center text-xs font-medium text-foreground-100 gap-1.5"
          color={cn(isOpened ? "text-foreground-100" : "text-foreground-400")}
        >
          <Thumbnail
            variant={isOpened ? "light" : "ghost"}
            size="xs"
            icon={<PencilIcon variant="solid" />}
            centered={true}
          />
          <p>Sign Message</p>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2 px-3 pb-3 rounded overflow-hidden">
          <MessageContent messages={messages} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

type SignMessagePolicyWithEnabled = SignMessagePolicy & {
  authorized?: boolean;
  id?: string;
};

export function MessageContent({
  messages,
}: {
  messages: SignMessagePolicyWithEnabled[];
}) {
  const { onToggleMessage, isEditable } = useCreateSession();

  return (
    <>
      {messages
        .filter((m) => (isEditable ? true : m.authorized))
        .map((m, i) => (
          <div
            key={`${m.domain.name}-${i}`}
            className="flex flex-col bg-background-200 gap-2 text-xs"
          >
            <div className="flex flex-row items-center justify-between">
              <p
                className={cn(
                  "py-2 font-bold",
                  m.authorized ? "text-foreground-200" : "text-foreground-400",
                )}
              >
                {m.name ?? `Message ${i + 1}`}
              </p>
              <Switch
                checked={m.authorized}
                onCheckedChange={(enabled) =>
                  m.id ? onToggleMessage(m.id, enabled) : null
                }
                className={cn(
                  isEditable ? "visible" : "invisible pointer-events-none", // use visible class to prevent layout shift
                )}
              />
            </div>

            <div className="flex flex-col gap-px rounded overflow-auto border border-background p-3">
              {/* Domain section */}
              {Object.values(m.domain).filter((f) => typeof f !== "undefined")
                .length > 0 && (
                <CollapsibleRow
                  key="domain"
                  title="domain"
                  enabled={m.authorized ?? true}
                >
                  {m.domain.name && (
                    <ValueRow
                      values={[
                        {
                          name: "name",
                          value: m.domain.name,
                        },
                      ]}
                      enabled={m.authorized ?? true}
                    />
                  )}
                </CollapsibleRow>
              )}

              <ValueRow
                values={[
                  {
                    name: "primaryType",
                    value: m.primaryType,
                  },
                ]}
                enabled={m.authorized ?? true}
              />

              <CollapsibleRow title="types" enabled={m.authorized ?? true}>
                {Object.entries(m.types).map(([name, types]) => (
                  <CollapsibleRow
                    key={name}
                    title={name}
                    enabled={m.authorized ?? true}
                  >
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
                        enabled={m.authorized ?? true}
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
  enabled: boolean;
}

export function CollapsibleRow({
  title,
  children,
  enabled,
}: CollapsibleRowProps) {
  const [value, setValue] = useState("");

  return (
    <Accordion type="single" collapsible value={value} onValueChange={setValue}>
      <AccordionItem value={title} className="flex flex-col">
        <AccordionTrigger
          hideIcon
          className={cn(
            "hover:bg-background-300 rounded-md",
            enabled ? "text-foreground-400" : "text-foreground-200",
          )}
        >
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
  enabled: boolean;
}

export function ValueRow({ values, enabled }: ValueRowProps) {
  return (
    <div
      className={cn(
        "flex items-center py-1 gap-1 ",
        enabled ? "text-foreground-400" : "text-foreground-400",
      )}
    >
      <ArrowTurnDownIcon size="sm" />
      <div className="flex items-center gap-2">
        {values.map((f) => (
          <div className="flex items-center gap-1 text-xs" key={f.name}>
            {f.name}:{" "}
            <Badge
              className={cn(
                "bg-background-200",
                enabled ? "text-foreground" : "text-foreground-400",
              )}
            >
              {f.value}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
