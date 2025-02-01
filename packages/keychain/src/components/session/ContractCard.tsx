import { useChainId } from "@/hooks/connection";
import type { Method } from "@cartridge/presets";
import {
  CodeIcon,
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
import { useCallback, useState } from "react";
import { constants } from "starknet";
import { AccordionCard } from "./AccordionCard";

interface ContractCardProps {
  address: string;
  methods: Method[];
  title: string;
  icon: React.ReactNode;
  isExpanded?: boolean;
}

export function ContractCard({
  address,
  methods,
  title,
  icon,
  isExpanded,
}: ContractCardProps) {
  const [tweakedMethod, setTweakedMethod] = useState(() =>
    methods.map((method) => ({
      ...method,
      enabled: true,
    })),
  );

  const chainId = useChainId();
  const explorer = useExplorer();

  const explorerLink = (
    <a
      className="text-xs text-muted-foreground cursor-pointer hover:underline"
      href={
        chainId === constants.StarknetChainId.SN_MAIN ||
        chainId === constants.StarknetChainId.SN_SEPOLIA
          ? explorer.contract(address)
          : `#`
      }
      target="_blank"
      rel="noreferrer"
    >
      {formatAddress(address, { first: 5, last: 5 })}
    </a>
  );

  const handleToggle = useCallback(
    (entrypoint: string, enabled: boolean) => {
      setTweakedMethod((prev) =>
        prev.map((method) =>
          method.entrypoint === entrypoint ? { ...method, enabled } : method,
        ),
      );
    },
    [setTweakedMethod],
  );

  return (
    <AccordionCard
      icon={icon ?? <CodeIcon variant="solid" />}
      title={<div className="text-xs font-bold uppercase">{title}</div>}
      subtitle={explorerLink}
      isExpanded={isExpanded}
      trigger={
        <div className="text-xs text-muted-foreground">
          Approve&nbsp;
          <span className="text-accent-foreground font-bold">
            {methods.length} {methods.length > 1 ? `methods` : "method"}
          </span>
        </div>
      }
      className="bg-background gap-px rounded overflow-auto border border-background"
    >
      {tweakedMethod.map((method) => (
        <div
          key={method.entrypoint}
          className="flex flex-col bg-background-100 gap-4 p-3 text-xs"
        >
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex flex-row items-center gap-2",
                method.enabled ? "text-accent-foreground " : "text-accent",
              )}
            >
              <p className="font-bold">
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
              color="accent"
              checked={method.enabled}
              onCheckedChange={(enabled) =>
                handleToggle(method.entrypoint, enabled)
              }
            />
            {/* <div className="text-muted-foreground">{method.entrypoint}</div> */}
          </div>
        </div>
      ))}
    </AccordionCard>
  );
}

function humanizeString(str: string): string {
  return (
    str
      // Convert from camelCase or snake_case
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to spaces
      .replace(/_/g, " ") // snake_case to spaces
      .toLowerCase()
      // Capitalize first letter
      .replace(/^\w/, (c) => c.toUpperCase())
  );
}
