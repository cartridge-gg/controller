import { IconProps } from "@chakra-ui/react";

export type DuotoneIconProps = IconProps & {
  accent?: ColorProp;
  accentHighlight?: ColorProp;
};

type ColorProp = IconProps["color"];
