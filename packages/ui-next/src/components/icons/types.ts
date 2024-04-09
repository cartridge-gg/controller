import { VariantProps } from "class-variance-authority";
import { iconVariants, duotoneIconVariants } from "./utils";

export type IconProps = React.SVGAttributes<SVGElement> &
  VariantProps<typeof iconVariants>;

export type DirectionalIconProps = React.SVGAttributes<SVGElement> &
  VariantProps<typeof iconVariants> & { variant: Direction };

export type Direction = "up" | "right" | "down" | "left";

export type DuotoneIconProps = React.SVGAttributes<SVGElement> &
  VariantProps<typeof duotoneIconVariants>;

export type StateIconProps = React.SVGAttributes<SVGElement> &
  VariantProps<typeof iconVariants> & { variant: "solid" | "line" };
