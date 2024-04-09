import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const WedgeRightIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M14.75 12a.685.685 0 0 1-.201.486l-4.125 4.125a.687.687 0 1 1-.973-.972L13.091 12 9.452 8.36a.687.687 0 1 1 .972-.971l4.125 4.125c.134.134.201.31.201.486Z"
    />
  </Icon>
));
