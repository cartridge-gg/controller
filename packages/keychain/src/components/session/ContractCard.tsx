import { CodeIcon } from "@cartridge/ui-next";
import { formatAddress } from "@cartridge/utils";
import { useExplorer } from "@starknet-react/core";
import { constants } from "starknet";
import { Method } from "@cartridge/presets";
import { AccordionCard } from "./AccordionCard";
import { useConnection } from "@/hooks/connection";

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
  const { controller } = useConnection();
  const explorer = useExplorer();

  const explorerLink = (
    <a
      className="text-xs text-muted-foreground cursor-pointer hover:underline"
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
      {methods.map((method) => (
        <div
          key={method.entrypoint}
          className="flex flex-col bg-background-200 gap-4 p-3 text-xs"
        >
          <div className="flex items-center justify-between">
            <div className="font-bold text-accent-foreground">
              {method.name ?? humanizeString(method.entrypoint)}
            </div>
            <div className="text-muted-foreground">{method.entrypoint}</div>
          </div>
          {method.description && (
            <div className="text-muted-foreground">{method.description}</div>
          )}
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
