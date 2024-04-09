import { VariantProps } from "class-variance-authority";
import { iconVariants, duotoneIconVariants } from "./utils";

export type IconProps = React.SVGAttributes<SVGElement> &
  VariantProps<typeof iconVariants>;

export type DuotoneIconProps = React.SVGAttributes<SVGElement> &
  VariantProps<typeof duotoneIconVariants>;
