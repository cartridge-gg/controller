import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const CaratRightIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="m10.4 8 4 4-4 4h-.8V8h.8Z" />
  </Icon>
));
