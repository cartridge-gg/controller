import React from "react";
import {
  Icon as ChakraIcon,
  IconProps,
  ThemingProps,
  useStyleConfig,
} from "@chakra-ui/react";
import { ReactNode } from "react";

export function Icon({
  className,
  children,
  viewBox = "0 0 16 16",
  ...rest
}: IconProps & {
  className?: string;
  children: ReactNode;
  viewBox?: string;
}) {
  const styles = useStyleConfig("Icon", rest as ThemingProps);

  return (
    <ChakraIcon
      className={className}
      width="16"
      height="16"
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      __css={styles}
      {...rest}
    >
      {children}
    </ChakraIcon>
  );
}

export default Icon;
