import * as React from "react";

import { cn } from "@/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col rounded overflow-hidden text-foreground gap-y-px shrink-0",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { icon?: React.ReactNode }
>(({ className, icon, ...props }, ref) =>
  icon ? (
    <div
      ref={ref}
      className={cn(
        "h-10 flex items-center gap-x-px bg-background-200",
        className,
      )}
    >
      {React.isValidElement(icon) ? (
        <CardIcon>{icon}</CardIcon>
      ) : (
        <CardIcon src={icon as string} />
      )}
      <div className="w-px h-full bg-background" />
      <div className={cn("p-3 w-full", className)} {...props} />
    </div>
  ) : (
    <div
      ref={ref}
      className={cn("flex flex-col gap-y-1 p-3 bg-background-200", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardHeaderRight = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("ml-auto", className)} {...props} />
));
CardHeaderRight.displayName = "CardHeaderRight";

export const CardIcon = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { src?: string }
>(
  ({ className, src, ...props }, ref): React.ReactNode => (
    <div
      ref={ref}
      className="h-9 w-9 p-2 bg-background-200 flex items-center justify-center"
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

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xs font-semibold text-foreground-400 tracking-wide",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-foreground-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm p-3 bg-background-200", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

export const CardListContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-px text-sm font-medium", className)}
    {...props}
  />
));
CardListContent.displayName = "CardListContent";

export const CardListItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { icon?: React.ReactNode }
>(({ className, icon, ...props }, ref) =>
  icon ? (
    <div
      ref={ref}
      className={cn("h-11 flex items-center gap-x-px bg-background", className)}
    >
      {React.isValidElement(icon) ? (
        <CardListItemIcon>{icon}</CardListItemIcon>
      ) : (
        <CardListItemIcon src={icon as string} />
      )}
      <div
        className={cn(
          "px-3 flex-1 h-full flex items-center justify-between bg-background-200",
          className,
        )}
        {...props}
      />
    </div>
  ) : (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-y-1 p-3 bg-background-200 justify-between",
        className,
      )}
      {...props}
    />
  ),
);
CardListItem.displayName = "CardListItem";

const CardListItemIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { src?: string }
>(({ className, src, ...props }, ref) => (
  <div
    ref={ref}
    className="h-11 w-11 bg-background-200 flex items-center justify-center"
  >
    {src ? (
      <img
        src={src}
        className={cn("h-6 aspect-square rounded-sm", className)}
        {...props}
      />
    ) : props.children ? (
      props.children
    ) : (
      <div
        className={cn(
          "h-6 aspect-square bg-[image:var(--theme-icon-url)] bg-cover bg-center place-content-center",
          className,
        )}
        {...props}
      />
    )}
  </div>
));
CardListItemIcon.displayName = "CardListItemIcon";
