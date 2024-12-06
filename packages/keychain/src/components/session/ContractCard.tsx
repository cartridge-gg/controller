import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardHeaderRight,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CircleIcon,
  InfoIcon,
  CardIcon,
  ExternalIcon,
  cn,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@cartridge/ui-next";
import { formatAddress, isSlotChain, StarkscanUrl } from "@cartridge/utils";
import { constants } from "starknet";
import { useConnection } from "hooks/connection";
import { ContractPolicy } from "@cartridge/presets";
import { toArray } from "@cartridge/controller";

interface ContractProps {
  address: string;
  title: string;
  methods: ContractPolicy["methods"];
  icon?: React.ReactNode;
}

export function ContractCard({ address, title, methods: _methods, icon = <CardIcon /> }: ContractProps) {
  const methods = toArray(_methods);
  const { chainId } = useConnection();
  const isSlot = !!chainId && isSlotChain(chainId);

  return (
    <Card>
      <CardHeader icon={icon}>
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardHeaderRight>
          <Link
            href={StarkscanUrl(chainId as constants.StarknetChainId).contract(address)}
            className={cn(
              "text-xs text-muted-foreground flex items-center gap-1 cursor-pointer",
              isSlot ? "pointer-events-none" : "",
            )}
            target="_blank"
            aria-disabled={isSlot}
            tabIndex={isSlot ? -1 : undefined}
          >
            {formatAddress(address, { size: "xs" })}
            <ExternalIcon size="xs" />
          </Link>
        </CardHeaderRight>
      </CardHeader>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <CardContent>
            <AccordionTrigger>
              Approve{" "}
              <span className="text-accent-foreground font-bold">
                {methods.length} {methods.length > 1 ? "methods" : "method"}
              </span>
            </AccordionTrigger>
          </CardContent>

          <AccordionContent>
            {methods.map((c) => (
              <CardContent key={c.entrypoint} className="flex items-center gap-1">
                <CircleIcon size="sm" className="text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div>{c.name}</div>
                  {c.description && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon size="sm" className="text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>{c.description}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardContent>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
} 