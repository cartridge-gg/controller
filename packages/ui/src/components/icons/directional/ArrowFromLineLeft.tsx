import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const ArrowFromLineLeftIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M18.279 5.143h1.72v13.714h-1.72V5.143ZM4.665 12.625 4.001 12l6.143-5.782 1.175 1.25-.625.586-3.282 3.089h8.41v1.714h-8.41l3.907 3.679-1.175 1.25-.625-.586-4.857-4.571.003-.004Z"
    />
  </Icon>
));
