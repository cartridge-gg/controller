import { useCreateSession } from "@/hooks/session";
import type { Method } from "@cartridge/presets";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CodeIcon,
  InfoIcon,
  Switch,
  Thumbnail,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useState, useEffect } from "react";

type MethodWithEnabled = Method & { authorized?: boolean; id?: string };

interface ContractCardProps {
  address: string;
  methods: MethodWithEnabled[];
  title: string;
  icon: React.ReactNode;
  isExpanded?: boolean;
  className?: string;
}

export function ContractCard({
  address,
  methods,
  title,
  icon,
  isExpanded = false,
  className,
}: ContractCardProps) {
  const [isOpened, setisOpened] = useState(isExpanded);
  const { onToggleMethod, isEditable } = useCreateSession();

  // Auto-open accordion when isEditable becomes true
  useEffect(() => {
    if (isEditable) {
      setisOpened(true);
    }
  }, [isEditable]);

  return (
    <Accordion
      type="single"
      collapsible
      className={cn("bg-background-200 rounded", className)}
      value={isOpened ? "item" : ""}
      onValueChange={(value) => setisOpened(value === "item")}
    >
      <AccordionItem value="item" className="flex flex-col">
        <AccordionTrigger
          parentClassName="h-11 p-3"
          className="flex items-center text-xs font-medium text-foreground-100 gap-1.5"
          color={cn(isOpened ? "text-foreground-100" : "text-foreground-400")}
        >
          <Thumbnail
            variant={isOpened ? "light" : "ghost"}
            size="xs"
            icon={icon ?? <CodeIcon variant="solid" />}
            centered={true}
          />
          <p>{`Authorize ${title}`}</p>
        </AccordionTrigger>

        <AccordionContent className="flex flex-col overflow-hidden gap-0 px-3 pb-3">
          <div className="border border-background-100 divide-y divide-background-100 rounded">
            {methods
              .filter((method) => (isEditable ? true : method.authorized))
              .map((method) => (
                <div
                  key={method.entrypoint}
                  className="flex items-center justify-between p-3"
                >
                  <div
                    className={cn(
                      "flex flex-row items-center gap-2",
                      method.authorized
                        ? "text-foreground-300"
                        : "text-background-500",
                    )}
                  >
                    <p className="font-medium text-xs">
                      {method.name ?? humanizeString(method.entrypoint)}
                    </p>
                    {method.description && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon size="sm" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{method.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <Switch
                    checked={method.authorized ?? true}
                    onCheckedChange={(enabled) =>
                      method.id
                        ? onToggleMethod(address, method.id, enabled)
                        : null
                    }
                    disabled={method.isRequired}
                    className={cn(
                      isEditable ? "visible" : "invisible pointer-events-none", // use visible class to prevent layout shift
                    )}
                  />
                </div>
              ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function humanizeString(str: string): string {
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
