import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "select-none inline-flex justify-center items-center gap-1.5 whitespace-nowrap rounded-md uppercase font-mono font-semibold ring-offset-background transition-colors transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-50 focus-visible:ring-foreground",
        secondary:
          "bg-background-200 text-foreground-100 hover:bg-background-300 disabled:text-foreground-300 disabled:bg-background-200",
        tertiary:
          "bg-background-200 text-foreground-300 font-medium hover:bg-background-300 hover:text-foreground-200 disabled:text-foreground-400 disabled:bg-background-200",
        icon: "bg-background-200 text-foreground-100 hover:bg-background-300 disabled:text-foreground-400 disabled:bg-background-200",
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
        tall: "h-full w-9 rounded-none p-2",
        icon: "h-10 w-10 flex items-center",
        thumbnail: "h-10 px-3",
      },
      status: {
        active:
          "bg-background-300 text-foreground-100 font-medium hover:bg-background-300 hover:text-foreground-100",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);
