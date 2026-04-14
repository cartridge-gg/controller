import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CheckboxIcon,
  Thumbnail,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { Call } from "starknet";
import { humanizeString } from "@cartridge/controller";
import { useState, PropsWithChildren } from "react";
import { ContractLink } from "@/components/ContractLink";
import { CallCardContents } from "@/components/transaction/CallCard";
import { SimulationResults } from "@/components/simulation/SimulationResults";

interface TransactionSummaryProps {
  calls: Call[];
  isExpanded?: boolean;
  simulate?: boolean;
  className?: string;
}

export function TransactionSummary({
  calls,
  isExpanded = false,
  simulate = false,
  className,
}: TransactionSummaryProps) {
  const [isOpened, setisOpened] = useState(isExpanded);

  return (
    <>
      {simulate && <SimulationResults calls={calls} />}
      <Accordion
        type="single"
        collapsible
        className={cn(
          "rounded border",
          isExpanded ? "text-foreground-100" : "text-foreground-300",
          isOpened
            ? "bg-background-200 border-transparent"
            : "bg-transparent border-background-200",
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
              isExpanded ? "text-foreground-100" : "text-foreground-300",
            )}
            color={cn(
              isExpanded ? "text-foreground-100" : "text-foreground-300",
            )}
          >
            <Thumbnail
              variant="light"
              size="sm"
              icon={calls.length}
              centered={true}
              className={cn(
                "text-xs",
                isExpanded ? "text-foreground-100" : "text-foreground-300",
                isOpened ? "bg-background-300" : "bg-background-200",
              )}
            />
            <p>Operations</p>
          </AccordionTrigger>

          <AccordionContent className="flex flex-col gap-3 px-3 pb-3 border-t border-background-100 pt-2">
            {calls.map((call, index) => (
              <CollapsibleTransactionRow
                key={`${index}-${call.entrypoint}`}
                transaction={call}
                enabled={true}
                highlighted={isExpanded}
              >
                <CallCardContents call={call} className="mt-2" />
              </CollapsibleTransactionRow>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

interface CollapsibleTransactionProps extends PropsWithChildren {
  transaction: Call;
  enabled: boolean;
  highlighted?: boolean;
}

export function CollapsibleTransactionRow({
  transaction,
  children,
  highlighted,
}: CollapsibleTransactionProps) {
  const [value, setValue] = useState("");

  return (
    <Accordion type="single" collapsible value={value} onValueChange={setValue}>
      <AccordionItem value={transaction.entrypoint} className="flex flex-col">
        <AccordionTrigger
          hideIcon
          parentClassName="transition-none"
          className={cn(
            "rounded-md w-full",
            highlighted ? "text-foreground-100" : "text-foreground-300",
          )}
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
