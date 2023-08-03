import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const SingularShapeSolidIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M4.11 7.682a1 1 0 0 1 1-1h13.36a1 1 0 0 1 1 1v4.941a1 1 0 0 1-.455.838l-6.728 4.38a2 2 0 0 1-1.092.324H5.11a1 1 0 0 1-1-1V7.682Z"
    />
  </Icon>
));
