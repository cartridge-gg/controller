import React from "react";
import { IconProps } from "@chakra-ui/react";
import Icon from "./Icon";

export function Minus({
  className,
  ...rest
}: IconProps & { className?: string }) {
  return (
    <Icon className={className} {...rest}>
      <path
        d="M20.5714 10H3.42857C2.63973 10 2 10.6397 2 11.4286V12.8571C2 13.646 2.63973 14.2857 3.42857 14.2857H20.5714C21.3603 14.2857 22 13.646 22 12.8571V11.4286C22 10.6397 21.3603 10 20.5714 10Z"
        fill="black"
      />
    </Icon>
  );
}

export default Minus;
