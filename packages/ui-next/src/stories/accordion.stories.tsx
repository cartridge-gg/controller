import React from "react";
import {
  Accordion as UIAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/primitives/accordion";
import { Meta, StoryObj } from "@storybook/react";
import { CircleIcon } from "../";
import { InfoIcon } from "../../dist";

const meta: Meta<typeof Accordion> = {
  title: "Accordion",
  component: Accordion,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  // args: { },
};

function Accordion() {
  return (
    <UIAccordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          You are agreeing to automate{" "}
          <span className="text-accent-foreground font-bold">2 methods</span>
        </AccordionTrigger>
        <AccordionContent className="gap-px">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i + 1} className="flex items-center gap-1">
              <CircleIcon size="sm" className="text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div>Method {i + 1}</div>
                <InfoIcon size="sm" className="text-muted-foreground" />
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </UIAccordion>
  );
}
