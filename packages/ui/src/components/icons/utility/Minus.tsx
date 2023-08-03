import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const MinusIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M20 13.712v-3.391H4v3.391h16Z" />
  </Icon>
));
