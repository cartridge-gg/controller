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

interface TransactionSummaryProps {
  calls: Call[];
  isExpanded?: boolean;
  className?: string;
  count?: number;
}

export function TransactionSummary({
  calls,
  isExpanded = false,
  className,
  count,
}: TransactionSummaryProps) {
  const [isOpened, setisOpened] = useState(isExpanded);

  return (
    <Accordion
      type="single"
      collapsible
      className={cn(
        "rounded border",
        isOpened
          ? "text-foreground-100 bg-background-200 border-transparent"
          : "text-foreground-300 bg-transparent border-background-200",
        className,
      )}
      value={isOpened ? "item" : ""}
      onValueChange={(value) => setisOpened(value === "item")}
    >
      <AccordionItem value="item">
        <AccordionTrigger
          parentClassName="h-11 p-3 transition-none"
          className={cn(
            "flex items-center text-sm font-medium gap-1.5",
            isOpened ? "text-foreground-100" : "text-foreground-300",
          )}
          color={cn(isOpened ? "text-foreground-100" : "text-foreground-300")}
        >
          <Thumbnail
            variant="light"
            size="sm"
            icon={
              <>
                <GearIcon size="sm" />
                {count || ""}
              </>
            }
            centered={true}
            className={cn(
              `w-[${(count?.toString() ?? "").length + 1}em]`,
              isOpened
                ? "text-foreground-100"
                : "text-foreground-300 bg-background-200",
            )}
          />
          <p>Advanced</p>
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-3 px-3 pb-3 border-t border-background-100 pt-2">
          {calls.map((call) => (
            <CollapsibleTransactionRow
              key={`${call.contractAddress}-${call.entrypoint}`}
              transaction={call}
              enabled={true}
            >
              <CallCardContents call={call} className="mt-2" />
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
          parentClassName="transition-none"
          className="rounded-md text-foreground-100 w-full"
        >
          <div className="flex gap-1 py-1 w-full text-xs items-center">
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
