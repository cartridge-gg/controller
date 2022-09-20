import React from "react";
import { IconProps } from "@chakra-ui/react";
import Icon from "./Icon";

export function Link({
  className,
  ...rest
}: IconProps & { className?: string }) {
  return (
    <Icon className={className} {...rest}>
      <path
        d="M2 12C2 9.2375 4.23844 7 7 7H10C10.5531 7 11 7.44687 11 8C11 8.55313 10.5531 9 10 9H7C5.31562 9 4 10.3156 4 12C4 13.6562 5.31562 15 7 15H10C10.5531 15 11 15.4469 11 16C11 16.5531 10.5531 17 10 17H7C4.23844 17 2 14.7625 2 12ZM17 17H14C13.4469 17 13 16.5531 13 16C13 15.4469 13.4469 15 14 15H17C18.6562 15 20 13.6562 20 12C20 10.3156 18.6562 9 17 9H14C13.4469 9 13 8.55313 13 8C13 7.44687 13.4469 7 14 7H17C19.7625 7 22 9.2375 22 12C22 14.7625 19.7625 17 17 17ZM15 11C15.5531 11 16 11.4469 16 12C16 12.5531 15.5531 13 15 13H9C8.44688 13 8 12.5531 8 12C8 11.4469 8.44688 11 9 11H15Z"
        fill="black"
      />
    </Icon>
  );
}

export default Link;
