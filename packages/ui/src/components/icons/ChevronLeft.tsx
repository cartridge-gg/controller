import React from "react";
import { IconProps } from "@chakra-ui/react";
import Icon from "./Icon";

export function ChevronLeft({
  className,
  ...rest
}: IconProps & { className?: string }) {
  return (
    <Icon className={className} {...rest}>
      <path
        d="M8.00024 12.0005C8.00024 12.293 8.11185 12.5855 8.33505 12.8084L15.1919 19.6652C15.6383 20.1116 16.3615 20.1116 16.8079 19.6652C17.2543 19.2188 17.2543 18.4956 16.8079 18.0492L10.7573 12.0005L16.807 5.95081C17.2534 5.5044 17.2534 4.78122 16.807 4.33481C16.3606 3.8884 15.6374 3.8884 15.191 4.33481L8.33416 11.1916C8.11095 11.4148 8.00024 11.7077 8.00024 12.0005Z"
        fill="black"
      />
    </Icon>
  );
}

export default ChevronLeft;
