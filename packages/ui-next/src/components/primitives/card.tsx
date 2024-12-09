import * as React from "react";

import { cn } from "@/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col rounded overflow-hidden text-secondary-foreground gap-y-px shrink-0",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { icon?: React.ReactNode }
>(({ className, icon, ...props }, ref) =>
  icon ? (
    <div
      ref={ref}
      className={cn("h-9 flex items-center gap-x-px bg-secondary", className)}
    >
      {icon}
      <div className="w-px h-full bg-background" />
      <div className={cn("p-3 w-full", className)} {...props} />
    </div>
  ) : (
    <div
      ref={ref}
      className={cn("flex flex-col gap-y-1 p-3 bg-secondary", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardHeaderRight = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("ml-auto", className)} {...props} />
));
CardHeaderRight.displayName = "CardHeaderRight";

const CardIcon = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { src?: string }
>(
  ({ className, src, ...props }, ref): React.ReactNode => (
    <div
      ref={ref}
      className="h-full p-2 aspect-square bg-secondary flex items-center justify-center"
    >
      {src ? (
        <img
          src={src}
          className={cn("aspect-square rounded-sm", className)}
          {...props}
        />
      ) : props.children ? (
        props.children
      ) : (
        <div
          className={cn(
            "h-8 aspect-square bg-[image:var(--theme-icon-url)] bg-cover bg-center place-content-center",
            className,
          )}
          {...props}
        />
      )}
    </div>
  ),
);
CardIcon.displayName = "CardIcon";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xs font-bold text-muted-foreground leading-none tracking-tight uppercase",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm p-3 bg-secondary", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm flex items-center p-3 bg-secondary", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardHeaderRight,
  CardIcon,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
