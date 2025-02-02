import { useChainId } from "@/hooks/connection";
import type { SessionContracts, SessionMessages } from "@/hooks/session";
import type { Method } from "@cartridge/presets";

interface MethodWithEnabled extends Method {
  enabled: boolean;
}

interface ContractWithEnabled {
  meta?: {
    name?: string;
    description?: string;
    type?: string;
  };
  name: string;
  description?: string;
  methods: MethodWithEnabled[];
}

type TweakedContracts = {
  [address: string]: ContractWithEnabled;
};
import {
  InfoIcon,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from "@cartridge/ui-next";
import { formatAddress } from "@cartridge/utils";
import { useExplorer } from "@starknet-react/core";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { constants } from "starknet";
import { AccordionCard } from "./AccordionCard";
import { MessageContent } from "./MessageCard";

interface AggregateCardProps {
  title: string;
  icon: React.ReactNode;
  contracts?: SessionContracts;
  messages?: SessionMessages;
}

export function AggregateCard({
  title,
  icon,
  contracts,
  messages,
}: AggregateCardProps) {
  const chainId = useChainId();
  const explorer = useExplorer();

  const [tweakedContracts, setTweakedContracts] = useState<TweakedContracts>(
    () => {
      if (!contracts) return {};
      return Object.entries(contracts).reduce((acc, [address, contract]) => {
        return {
          ...acc,
          [address]: {
            ...contract,
            methods: contract.methods.map((method) => ({
              ...method,
              enabled: true,
            })),
          },
        };
      }, {});
    },
  );

  const [tweakedMessages, setTweakedMessages] = useState(() => {
    if (!messages || messages.length === 0) {
      return [];
    }
    return messages.map((message) => ({
      ...message,
      enabled: true,
    }));
  });

  const handleMessageToggle = useCallback(
    (index: number, enabled: boolean) => {
      setTweakedMessages((prev) =>
        prev.map((m, i) => (i === index ? { ...m, enabled } : m)),
      );
    },
    [setTweakedMessages],
  );

  const totalEnabledMethods = useMemo(
    () =>
      Object.values(tweakedContracts || {}).reduce((acc, contract) => {
        return (
          acc +
          (contract.methods?.filter((method) => method.enabled)?.length || 0)
        );
      }, 0),
    [tweakedContracts],
  );

  const totalEnabledMessages = tweakedMessages?.filter(
    (message) => message.enabled,
  )?.length;

  const count = totalEnabledMethods + totalEnabledMessages;

  return (
    <AccordionCard
      icon={icon}
      title={title}
      trigger={
        <div className="text-xs text-muted-foreground">
          Approve&nbsp;
          <span className="text-accent-foreground font-bold">
            {count} {count > 1 ? `items` : "item"}
          </span>
        </div>
      }
      className="gap-2"
    >
      {Object.entries(tweakedContracts || {}).map(
        ([address, { name, methods }]) => (
          <div key={address} className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-background-100 text-xs">
              <div className="py-2 font-bold">{name}</div>
              <Link
                to={
                  chainId === constants.StarknetChainId.SN_MAIN ||
                  chainId === constants.StarknetChainId.SN_SEPOLIA
                    ? explorer.contract(address)
                    : `#` // TODO: Add explorer for worlds.dev
                }
                target="_blank"
                className="text-muted-foreground hover:underline"
              >
                {formatAddress(address, { first: 5, last: 5 })}
              </Link>
            </div>

            <div className="flex flex-col gap-px rounded overflow-auto border border-background">
              {methods.map((method: MethodWithEnabled) => (
                <div
                  key={method.name}
                  className="flex flex-col p-3 gap-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "flex flex-row items-center gap-2",
                        method.enabled
                          ? "text-accent-foreground "
                          : "text-accent",
                      )}
                    >
                      <p className="font-bold">{method.name}</p>
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
                      checked={method.enabled}
                      onCheckedChange={(enabled) => {
                        setTweakedContracts((prev) => ({
                          ...prev,
                          [address]: {
                            ...prev[address],
                            methods: prev[address].methods.map((m) =>
                              m.entrypoint === method.entrypoint
                                ? { ...m, enabled }
                                : m,
                            ),
                          },
                        }));
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      )}

      {messages && (
        <MessageContent
          messages={tweakedMessages}
          onToggle={handleMessageToggle}
        />
      )}
    </AccordionCard>
  );
}
