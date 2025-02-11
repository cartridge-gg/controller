import {
  type SessionContracts,
  type SessionMessages,
  useCreateSession,
} from "@/hooks/session";

import { useConnection } from "@/hooks/connection";
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
  const { controller } = useConnection();
  const explorer = useExplorer();
  const { onToggleMethod } = useCreateSession();

  const totalEnabledMessages =
    messages?.filter((message) => message.authorized)?.length ?? 0;

  // const count = totalEnabledMethods + totalEnabledMessages;
  const totalEnabledMethods = Object.values(contracts ?? {}).reduce(
    (acc, contract) =>
      acc + contract.methods.filter((method) => method.authorized).length,
    0,
  );

  const count = totalEnabledMethods + totalEnabledMessages;

  return (
    <AccordionCard
      icon={icon}
      title={title}
      trigger={
        <div className="text-xs text-foreground-400">
          Approve&nbsp;
          <span className="text-foreground-200 font-bold">
            {count} {count > 1 ? `items` : "item"}
          </span>
        </div>
      }
      className="gap-2"
    >
      {Object.entries(contracts || {}).map(([address, { name, methods }]) => (
        <div key={address} className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-background-200 text-xs">
            <div className="py-2 font-bold">{name}</div>
            <Link
              to={
                controller?.chainId() === constants.StarknetChainId.SN_MAIN ||
                controller?.chainId() === constants.StarknetChainId.SN_SEPOLIA
                  ? explorer.contract(address)
                  : `#` // TODO: Add explorer for worlds.dev
              }
              target="_blank"
              className="text-foreground-400 hover:underline"
            >
              {formatAddress(address, { first: 5, last: 5 })}
            </Link>
          </div>

          <div className="flex flex-col gap-px rounded overflow-auto border border-background">
            {methods.map((method) => (
              <div
                key={method.name}
                className="flex flex-col p-3 gap-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "flex flex-row items-center gap-2",
                      method.authorized
                        ? "text-foreground-200 "
                        : "text-foreground-400",
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
                    checked={method.authorized ?? true}
                    onCheckedChange={(enabled) =>
                      method.id
                        ? onToggleMethod(address, method.id, enabled)
                        : null
                    }
                    disabled={method.isRequired}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {messages && <MessageContent messages={messages} />}
    </AccordionCard>
  );
}
