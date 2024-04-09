import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const WedgeUpIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12 9.25c.176 0 .352.067.486.201l4.125 4.125a.687.687 0 1 1-.972.973L12 10.909l-3.64 3.639a.687.687 0 1 1-.971-.972l4.125-4.125c.134-.134.31-.201.486-.201Z"
    />
  </Icon>
));
