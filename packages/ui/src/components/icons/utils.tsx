import { cva } from "class-variance-authority";

const base = "";

export const size = {
  "2xs": "h-3 w-3",
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  default: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
  "2xl": "h-14 w-14",
  "3xl": "h-[72px] w-[72px]",
  collectible: "h-[24px] w-[24px]",
};

export const iconVariants = cva(base, {
  variants: {
    size,
  },
  defaultVariants: {
    size: "default",
  },
});
