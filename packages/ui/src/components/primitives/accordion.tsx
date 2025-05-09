"use client";

import { cn } from "@/utils";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";
import { WedgeIcon } from "../icons";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={className} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    hideIcon?: boolean;
    color?: string;
    parentClassName?: string;
    wedgeIconSize?: "2xs" | "xs" | "sm" | "default" | "lg" | "xl" | "2xl";
  }
>(
  (
    {
      className,
      children,
      hideIcon,
      color,
      parentClassName,
      wedgeIconSize,
      ...props
    },
    ref,
  ) => (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "w-full flex items-center justify-between text-sm text-foreground-400 transition-all text-left [&[data-state=open]>svg]:rotate-90",
          parentClassName,
        )}
        {...props}
      >
        <div className={cn("flex items-center", className)}>{children}</div>
        {!hideIcon && (
          <WedgeIcon
            variant="right"
            size={wedgeIconSize}
            className={cn("transition-transform duration-200", color)}
          />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  ),
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("flex flex-col gap-px", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
