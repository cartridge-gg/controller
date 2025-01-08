import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@cartridge/ui-next";

interface AccordionCardProps {
  icon: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  isExpanded?: boolean;
}

export function AccordionCard({
  icon,
  title,
  subtitle,
  children,
  trigger,
  isExpanded,
}: AccordionCardProps) {
  return (
    <Card>
      <CardHeader icon={icon} className="pl-0">
        <div className="flex items-center justify-between">
          {typeof title === "string" ? (
            <CardTitle className="text-foreground">{title}</CardTitle>
          ) : (
            title
          )}
          {subtitle}
        </div>
      </CardHeader>

      <CardContent>
        <Accordion
          type="single"
          collapsible
          defaultValue={isExpanded ? "item" : undefined}
        >
          <AccordionItem value="item" className="flex flex-col gap-4">
            <AccordionTrigger className="text-xs text-muted-foreground">
              {trigger}
            </AccordionTrigger>

            <AccordionContent className="text-xs flex flex-col bg-background border border-background rounded-md gap-px">
              {children}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
