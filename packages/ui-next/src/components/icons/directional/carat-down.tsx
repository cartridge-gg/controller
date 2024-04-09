import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const CaratDownIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="m16 10.4-4 4-4-4v-.8h8v.8Z" />
  </Icon>
));
