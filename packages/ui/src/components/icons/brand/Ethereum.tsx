import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const EthereumIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M16.7469 12.15L12 15.05L7.25 12.15L12 4L16.7469 12.15ZM12 15.9812L7.25 13.0813L12 20L16.75 13.0813L12 15.9812Z"
      fill="currentColor"
    />
  </Icon>
));
