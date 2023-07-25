import React from "react";
import { IconProps } from "@chakra-ui/react";
import Icon from "./Icon";

export function AnglesDown({
  className,
  ...rest
}: IconProps & { className?: string }) {
  return (
    <Icon className={className} {...rest}>
      <path
        fill="#000"
        d="M11.52 12.254c.239.242.554.361.87.361.315 0 .63-.12.87-.36L19.412 6.1a1.23 1.23 0 10-1.74-1.74l-5.284 5.285-5.283-5.285a1.23 1.23 0 10-1.74 1.74l6.154 6.153zm6.154-.508l-5.285 5.285-5.283-5.285a1.23 1.23 0 10-1.74 1.74l6.153 6.154c.24.24.555.36.87.36.316 0 .63-.12.87-.36l6.154-6.154a1.23 1.23 0 10-1.739-1.74z"
      ></path>
    </Icon>
  );
}

export default AnglesDown;
