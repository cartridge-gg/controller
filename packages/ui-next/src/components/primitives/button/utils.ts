import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex justify-center items-center gap-1.5 whitespace-nowrap rounded-md uppercase font-mono font-semibold ring-offset-background transition-colors transition-opacity disabled:text-foreground-300 disabled:bg-background-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:opacity-80 disabled:bg-background-200",
        secondary:
          "bg-background-200 text-foreground-100 hover:bg-background-300",
        tertiary:
          "bg-background-200 text-foreground-300 font-medium hover:bg-background-300 hover:text-foreground-200",
        icon: "bg-background-200 text-foreground-100 hover:bg-background-300",
        link: "normal-case tracking-normal font-sans font-normal bg-background-100 border border-background-200 text-foreground-300 hover:border-background-300",
        // TODO: The following variants should be removed
        destructive:
          "bg-destructive-100 text-destructive-foreground shadow-sm hover:bg-destructive-100",
        outline:
          "border border-input bg-background shadow-sm hover:bg-background-500 hover:text-foreground-200",
        ghost: "hover:bg-background-500 hover:text-foreground-200",
      },
      size: {
        default: "h-10 px-6 py-2.5 text-base/[20px] tracking-wide",
        icon: "h-10 w-12 px-3",
      },
      status: {
        active:
          "bg-background-400 text-foreground-100 font-medium hover:bg-background-400 hover:text-foreground-100",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
