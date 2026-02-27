import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CheckboxIcon,
  GearIcon,
  Thumbnail,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { Call } from "starknet";
import { humanizeString } from "@cartridge/controller";
import { useState, PropsWithChildren } from "react";
import { ContractLink } from "@/components/ContractLink";
import { CallCardContents } from "../transaction/CallCard";

interface AdvancedTransactionsProps {
  transactions: Call[];
  isExpanded?: boolean;
  className?: string;
}

export function AdvancedTransactions({
  transactions,
  isExpanded = false,
  className,
}: AdvancedTransactionsProps) {
  const [isOpened, setisOpened] = useState(isExpanded);

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
            icon={<GearIcon />}
            centered={true}
          />
          <p>Advanced</p>
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-3 px-3 pb-3">
          {transactions.map((call) => (
            <CollapsibleTransactionRow
              key={`${call.contractAddress}-${call.entrypoint}`}
              transaction={call}
              enabled={true}
            >
              <CallCardContents call={call} />
              {/* <div className="flex flex-col gap-px rounded overflow-auto border border-background divide-y divide-solid divide-background">
                <div className="flex flex-col p-3 gap-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-row items-center gap-2 text-foreground-300">
                      <p className="font-medium text-xs">
                        {humanizeString(call.entrypoint)}
                      </p>
                    </div>
                  </div>
                </div>
              </div> */}
            </CollapsibleTransactionRow>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

interface CollapsibleTransactionProps extends PropsWithChildren {
  transaction: Call;
  enabled: boolean;
}

export function CollapsibleTransactionRow({
  transaction,
  children,
}: CollapsibleTransactionProps) {
  const [value, setValue] = useState("");

  return (
    <Accordion type="single" collapsible value={value} onValueChange={setValue}>
      <AccordionItem value={transaction.entrypoint} className="flex flex-col">
        <AccordionTrigger
          hideIcon
          className="hover:bg-background-300 rounded-md text-foreground-100 w-full"
        >
          <div className="flex gap-1 py-1 w-full">
            <CheckboxIcon
              variant={value ? "minus-line" : "plus-line"}
              size="sm"
            />
            <h1 className="flex-grow text-foregroung-100">
              {humanizeString(transaction.entrypoint)}
            </h1>
            <ContractLink
              contractAddress={transaction.contractAddress}
              className="text-foreground-400"
            />
          </div>
        </AccordionTrigger>

        <AccordionContent className="flex flex-col">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
