import { cva } from "class-variance-authority";

export const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-background-200 hover:text-foreground-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background-500 data-[state=on]:text-foreground-200",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-background-500 hover:text-foreground-200",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-8 px-2",
        lg: "h-10 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
