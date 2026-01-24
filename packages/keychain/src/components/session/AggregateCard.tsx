import {
  type SessionContracts,
  type SessionMessages,
  useCreateSession,
} from "@/hooks/session";

import { useConnection } from "@/hooks/connection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CodeIcon,
  InfoIcon,
  Switch,
  Thumbnail,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/ui";
import { formatAddress, cn } from "@cartridge/ui/utils";
import { useExplorer } from "@starknet-react/core";
import { Link } from "react-router-dom";
import { constants } from "starknet";
import { MessageContent } from "./MessageCard";
import { humanizeString } from "@cartridge/controller";
import { useState, useEffect } from "react";

interface AggregateCardProps {
  title: string;
  icon: React.ReactNode;
  contracts?: SessionContracts;
  messages?: SessionMessages;
  isExpanded?: boolean;
  className?: string;
}

export function AggregateCard({
  title,
  icon,
  contracts,
  messages,
  isExpanded = false,
  className,
}: AggregateCardProps) {
  const [isOpened, setisOpened] = useState(isExpanded);
  const { controller } = useConnection();
  const explorer = useExplorer();
  const { onToggleMethod, isEditable } = useCreateSession();

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
          className="flex items-center text-sm font-medium text-foreground-100 gap-1.5"
          color={cn(isOpened ? "text-foreground-100" : "text-foreground-400")}
        >
          <Thumbnail
            variant={isOpened ? "light" : "ghost"}
            size="sm"
            icon={icon ?? <CodeIcon variant="solid" />}
            centered={true}
          />
          <p>{`Authorize ${title}`}</p>
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-2 px-3 pb-3">
          {Object.entries(contracts || {}).map(
            ([address, { name, methods }]) => (
              <div key={address} className="flex flex-col gap-2">
                <div className="py-2 px-1 flex items-center justify-between bg-background-200 text-xs font-medium">
                  <h1 className="text-foregroung-100">{name}</h1>
                  <Link
                    to={
                      controller?.chainId() ===
                        constants.StarknetChainId.SN_MAIN ||
                      controller?.chainId() ===
                        constants.StarknetChainId.SN_SEPOLIA
                        ? explorer.contract(address)
                        : `#` // TODO: Add explorer for worlds.dev
                    }
                    target="_blank"
                    className="text-foreground-400 hover:underline"
                  >
                    {formatAddress(address, { first: 5, last: 5 })}
                  </Link>
                </div>

                <div className="flex flex-col gap-px rounded overflow-auto border border-background divide-y divide-solid divide-background">
                  {methods
                    .filter((method) => (isEditable ? true : method.authorized))
                    .map((method) => (
                      <div
                        key={method.entrypoint}
                        className="flex flex-col p-3 gap-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={cn(
                              "flex flex-row items-center gap-2",
                              method.authorized
                                ? "text-foreground-300"
                                : "text-background-500",
                            )}
                          >
                            <p className="font-medium text-xs">
                              {method.name ?? humanizeString(method.entrypoint)}
                            </p>
                            {method.description && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <InfoIcon size="sm" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{method.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <Switch
                            checked={method.authorized ?? true}
                            onCheckedChange={(enabled) =>
                              method.id
                                ? onToggleMethod(address, method.id, enabled)
                                : null
                            }
                            disabled={method.isRequired}
                            className={cn(
                              isEditable
                                ? "visible"
                                : "invisible pointer-events-none", // use visible class to prevent layout shift
                            )}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ),
          )}
          {messages && <MessageContent messages={messages} />}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
