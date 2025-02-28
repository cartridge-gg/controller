import { useConnection } from "@/hooks/connection";
import { useCreateSession } from "@/hooks/session";
import type { Method } from "@cartridge/controller";
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
import { constants } from "starknet";
import { AccordionCard } from "./AccordionCard";

type MethodWithEnabled = Method & { authorized?: boolean; id?: string };

interface ContractCardProps {
  address: string;
  methods: MethodWithEnabled[];
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
  const { controller } = useConnection();
  const explorer = useExplorer();
  const { onToggleMethod, isEditable } = useCreateSession();

  const explorerLink = (
    <a
      className="text-xs text-foreground-400 cursor-pointer hover:underline"
      href={
        controller?.chainId() === constants.StarknetChainId.SN_MAIN ||
        controller?.chainId() === constants.StarknetChainId.SN_SEPOLIA
          ? explorer.contract(address)
          : `#`
      }
      target="_blank"
      rel="noreferrer"
    >
      {formatAddress(address, { first: 5, last: 5 })}
    </a>
  );

  const totalEnabledMethod = methods.filter(
    (method) => method.authorized,
  ).length;

  return (
    <AccordionCard
      icon={icon ?? <CodeIcon variant="solid" />}
      title={<div className="text-xs font-semibold">{title}</div>}
      subtitle={explorerLink}
      isExpanded={isExpanded}
      trigger={
        <div className="text-xs text-foreground-300">
          Approve&nbsp;
          <span className="text-foreground-200 font-bold">
            {totalEnabledMethod} {totalEnabledMethod > 1 ? `methods` : "method"}
          </span>
        </div>
      }
      className="bg-background gap-px rounded overflow-auto border border-background"
    >
      {methods
        .filter((method) => (isEditable ? true : method.authorized))
        .map((method) => (
          <div
            key={method.entrypoint}
            className="flex flex-col bg-background-200 gap-4 p-3 text-xs"
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
                  method.id ? onToggleMethod(address, method.id, enabled) : null
                }
                disabled={method.isRequired}
                className={cn(
                  isEditable ? "visible" : "invisible pointer-events-none", // use visible class to prevent layout shift
                )}
              />
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
