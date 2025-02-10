import React from "react";
import { formatAddress } from "@cartridge/utils";
import { useExplorer } from "@starknet-react/core";
import { constants } from "starknet";
import { Method } from "@cartridge/presets";
import { useConnection } from "@/hooks/connection";
import { SessionContracts, SessionMessages } from "@/hooks/session";
import { Link } from "react-router-dom";
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

  const totalMethods = Object.values(contracts || {}).reduce(
    (acc, contract) => {
      return acc + (contract.methods?.length || 0);
    },
    0,
  );

  const totalMessages = messages?.length ?? 0;
  const count = totalMethods + totalMessages;

  return (
    <AccordionCard
      icon={icon}
      title={title}
      trigger={
        <div className="text-xs text-foreground-400">
          Approve&nbsp;
          <span className="text-accent-foreground font-bold">
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
            {methods.map((method: Method) => (
              <div
                key={method.name}
                className="flex flex-col p-3 gap-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-accent-foreground">
                    {method.name}
                  </div>
                  <div className="text-foreground-400">
                    {method.entrypoint}
                  </div>
                </div>
                {method.description && (
                  <div className="text-foreground-400">
                    {method.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {messages && <MessageContent messages={messages} />}
    </AccordionCard>
  );
}
