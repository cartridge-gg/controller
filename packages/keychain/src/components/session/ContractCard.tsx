import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@cartridge/ui-next";
import { formatAddress } from "@cartridge/utils";
import { useExplorer } from "@starknet-react/core";
import { constants } from "starknet";
import { Method } from "@cartridge/presets";
import { useChainId } from "@/hooks/connection";

interface ContractCardProps {
  address: string;
  methods: Method[];
  title: string;
  icon: React.ReactNode;
}

export function ContractCard({
  address,
  methods,
  title,
  icon,
}: ContractCardProps) {
  const chainId = useChainId();
  const explorer = useExplorer();

  return (
    <Card>
      <CardHeader icon={icon}>
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase">{title}</div>
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
        </div>
      </CardHeader>

      <CardContent>
        <Accordion type="multiple" defaultValue={["methods"]}>
          <AccordionItem value="methods" className="flex flex-col gap-4">
            <AccordionTrigger className="text-xs text-muted-foreground">
              Approve{" "}
              <span className="text-accent-foreground font-bold">
                {methods.length} {methods.length > 1 ? "methods" : "method"}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-background border border-background rounded-md flex flex-col gap-px">
                {methods.map((method) => (
                  <div
                    key={method.entrypoint}
                    className="flex flex-col bg-secondary gap-4 p-3 first:rounded-t-md last:rounded-b-md text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold">
                        {method.name ?? humanizeString(method.entrypoint)}
                      </div>
                      <div className="text-accent-foreground">
                        {method.entrypoint}
                      </div>
                    </div>
                    {method.description && (
                      <div className="text-muted-foreground">
                        {method.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function humanizeString(str: string): string {
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
