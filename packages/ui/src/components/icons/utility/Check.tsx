import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const CheckIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M8.364 18.546 4 14.182l1.454-1.454 2.91 2.91L18.546 5.453 20 6.91 8.364 18.546Z"
    />
  </Icon>
));
