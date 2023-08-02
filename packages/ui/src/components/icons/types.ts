import { ThemingProps, IconProps } from "@chakra-ui/react";

export type Props = ThemingProps & IconProps;

export type ColorIconProps = Omit<Props, "color" | "colorScheme" | "fill">;

export type DuotoneIconProps = Props & {
  accent?: Props["color"];
  accentHighlight?: Props["color"];
};
