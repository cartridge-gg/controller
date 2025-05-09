import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";

interface AccordionCardProps {
  icon: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  isExpanded?: boolean;
  className?: string;
}

export function AccordionCard({
  icon,
  title,
  subtitle,
  children,
  trigger,
  isExpanded,
  className,
}: AccordionCardProps) {
  return (
    <Card>
      <CardHeader icon={icon}>
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
          <AccordionItem value="item" className="flex flex-col gap-2">
            <AccordionTrigger className="text-xs text-foreground-400">
              {trigger}
            </AccordionTrigger>

            <AccordionContent className={cn("flex flex-col", className)}>
              {children}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
