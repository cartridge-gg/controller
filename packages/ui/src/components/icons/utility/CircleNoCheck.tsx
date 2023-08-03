import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const CircleNoCheckIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 2a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
      clipRule="evenodd"
    />
  </Icon>
));
