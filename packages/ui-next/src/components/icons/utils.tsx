import { cva } from "class-variance-authority";

const base = "";

export const size = {
  sm: "h-4 w-4",
  default: "h-6 w-6",
  lg: "h-8 w-8",
};

export const iconVariants = cva(base, {
  variants: {
    size,
  },
  defaultVariants: {
    size: "default",
  },
});

export const duotoneVariant = {
  default: "[&>*.accentColor]:fill-tertiary",
  destructive:
    "[&>*.accentColor]:fill-destructive [&>*.color]:fill-destructive",
};

export const duotoneIconVariants = cva(base, {
  variants: {
    size,
    variant: duotoneVariant,
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});
