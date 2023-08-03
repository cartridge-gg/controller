import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const CloneSolidIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M4 18c0 1.103.897 2 2 2h7c1.103 0 2-.897 2-2v-2h-4a3 3 0 0 1-3-3V9H6c-1.103 0-2 .897-2 2v7Zm7-3h7c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-7c-1.103 0-2 .897-2 2v7c0 1.103.897 2 2 2Z"
    />
  </Icon>
));
