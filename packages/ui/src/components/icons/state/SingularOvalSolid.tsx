import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const SingularOvalSolidIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <ellipse cx="12" cy="12" fill="currentColor" rx="7.675" ry="6.5" />
  </Icon>
));
