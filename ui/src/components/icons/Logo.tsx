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
  ...rest
}: IconProps & {
  className?: string;
  children: ReactNode;
}) {
  const styles = useStyleConfig("Logo", rest as ThemingProps);

  return (
    <ChakraIcon
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      __css={styles}
      {...rest}
    >
      {children}
    </ChakraIcon>
  );
}

export default Icon;
