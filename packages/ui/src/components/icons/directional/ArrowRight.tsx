import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const ArrowRightIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="m13.45 5.38 6.284 6a.858.858 0 0 1 0 1.24l-6.285 6a.858.858 0 0 1-1.183-1.24l4.74-4.522H4.856a.858.858 0 0 1 0-1.714h12.146l-4.74-4.521a.86.86 0 0 1-.028-1.214c.329-.343.84-.355 1.214-.03Z"
    />
  </Icon>
));
