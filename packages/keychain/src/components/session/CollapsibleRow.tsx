import { PropsWithChildren, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CheckboxIcon,
} from "@cartridge/ui-next";

interface CollapsibleRowProps extends PropsWithChildren {
  title: string;
}

export function CollapsibleRow({ title, children }: CollapsibleRowProps) {
  const [value, setValue] = useState("");

  return (
    <Accordion type="single" collapsible value={value} onValueChange={setValue}>
      <AccordionItem value={title} className="flex flex-col">
        <AccordionTrigger hideIcon className="hover:bg-accent rounded-md">
          <div className="flex items-center gap-1 py-2">
            <CheckboxIcon variant={value ? "minus-line" : "plus-line"} />
            <div>{title}</div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="ml-5 flex flex-col">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
