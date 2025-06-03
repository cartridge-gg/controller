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
} from "@cartridge/ui";
import { formatAddress, cn } from "@cartridge/ui/utils";
import { useExplorer } from "@starknet-react/core";
import { Link } from "react-router-dom";
import { constants } from "starknet";
import { AccordionCard } from "./AccordionCard";
import { MessageContent } from "./MessageCard";
import { humanizeString } from "@cartridge/controller";

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
  const { onToggleMethod, isEditable } = useCreateSession();

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
        <div className="text-xs text-foreground-300">
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
            <div className="py-2 font-medium">{name}</div>
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
      ))}

      {messages && <MessageContent messages={messages} />}
    </AccordionCard>
  );
}
