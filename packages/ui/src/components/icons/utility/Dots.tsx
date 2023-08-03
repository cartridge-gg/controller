import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const DotsIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M16.308 12A1.847 1.847 0 1 1 20 12a1.847 1.847 0 0 1-3.693 0Zm-6.154 0a1.847 1.847 0 1 1 3.693.001A1.847 1.847 0 0 1 10.154 12Zm-2.462 0A1.846 1.846 0 1 1 4 12a1.846 1.846 0 0 1 3.692 0Z"
    />
  </Icon>
));
