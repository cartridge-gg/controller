import React from "react";
import { IconProps } from "@chakra-ui/react";
import Icon from "./Icon";

export function Square({
  className,
  ...rest
}: IconProps & { className?: string }) {
  return (
    <Icon className={className} {...rest}>
      <path
        d="M19.1429 2C20.7188 2 22 3.27902 22 4.85714V19.1429C22 20.7188 20.7188 22 19.1429 22H4.85714C3.27902 22 2 20.7188 2 19.1429V4.85714C2 3.27902 3.27902 2 4.85714 2H19.1429ZM19.1429 4.14286H4.85714C4.4625 4.14286 4.14286 4.4625 4.14286 4.85714V19.1429C4.14286 19.5357 4.4625 19.8571 4.85714 19.8571H19.1429C19.5357 19.8571 19.8571 19.5357 19.8571 19.1429V4.85714C19.8571 4.4625 19.5357 4.14286 19.1429 4.14286Z"
        fill="black"
      />
    </Icon>
  );
}

export default Square;
