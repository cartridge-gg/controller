import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const CaratLeftIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="m13.6 16-4-4 4-4h.8v8h-.8Z" />
  </Icon>
));
