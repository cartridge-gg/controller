import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const CaratUpIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="m8 13.6 4-4 4 4v.8H8v-.8Z" />
  </Icon>
));
