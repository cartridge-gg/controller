import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const PacmanIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M19.391 15.062a8 8 0 1 1 0-6.123L12 12l7.391 3.062Z"
    />
  </Icon>
));
