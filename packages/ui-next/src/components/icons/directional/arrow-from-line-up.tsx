import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const ArrowFromLineUpIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M18.857 18.279v1.72H5.143v-1.72h13.714ZM11.375 4.665 12 4.001l5.782 6.143-1.25 1.175-.586-.625-3.089-3.282v8.41h-1.714v-8.41l-3.679 3.907-1.25-1.175.586-.625 4.571-4.857.004.003Z"
    />
  </Icon>
));
