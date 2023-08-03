import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const AlertIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="m12 3-9 9 9 9 9-9-9-9Zm.844 4.5v5.625h-1.688V7.5h1.688Zm-1.688 8.438V14.25h1.688v1.688h-1.688Z"
    />
  </Icon>
));
