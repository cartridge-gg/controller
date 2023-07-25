import React from "react";
import { Icon, IconProps } from "@chakra-ui/react";

const ChevronPixel = ({
  direction,
  ...rest
}: IconProps & {
  direction?: string;
}) => {
  let rotate = 0;
  if (direction) {
    switch (direction) {
      case "up":
        rotate = -90;
        break;
      case "down":
        rotate = 90;
        break;
      case "left":
        rotate = 180;
        break;
    }
  }

  return (
    <Icon
      w="4px"
      h="6px"
      viewBox="0 0 4 6"
      fill="#444E44"
      transform={`rotate(${rotate}deg)`}
      {...rest}
    >
      <path d="M2.4 2.4V3.6H3.6V2.4H2.4Z" />
      <path d="M1.2 1.2V2.4H2.4V1.2L1.2 1.2Z" />
      <path d="M1.2 2.4V3.6H2.4V2.4H1.2Z" />
      <path d="M0 1.2L5.24546e-08 2.4H1.2V1.2H0Z" />
      <path d="M0 5.24535e-08V1.2H1.2L1.2 0L0 5.24535e-08Z" />
      <path d="M5.24546e-08 2.4V3.6H1.2V2.4H5.24546e-08Z" />
      <path d="M1.2 3.6V4.8H2.4V3.6H1.2Z" />
      <path d="M5.24546e-08 3.6V4.8H1.2V3.6H5.24546e-08Z" />
      <path d="M5.24546e-08 4.8V6H1.2V4.8H5.24546e-08Z" />
    </Icon>
  );
};

export default ChevronPixel;
