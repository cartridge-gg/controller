import {
  Accordion as UIAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#components/primitives/accordion";
import { Meta, StoryObj } from "@storybook/react";
import { CircleIcon, InfoIcon } from "../";

const meta: Meta<typeof Accordion> = {
  title: "Primitives/Accordion",
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
        <AccordionTrigger className="gap-1">
          Approve{" "}
          <span className="text-foreground-200 font-bold">2 methods</span>
        </AccordionTrigger>
        <AccordionContent className="gap-px">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i + 1} className="flex items-center gap-1">
              <CircleIcon size="sm" className="text-foreground-400" />
              <div className="flex items-center gap-2">
                <div>Method {i + 1}</div>
                <InfoIcon size="sm" className="text-foreground-400" />
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </UIAccordion>
  );
}
