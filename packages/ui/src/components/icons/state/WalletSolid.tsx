import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const WalletSolidIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M6 5c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7c0-1.103-.897-2-2-2H6.5a.501.501 0 0 1-.5-.5c0-.275.225-.5.5-.5H18a.999.999 0 1 0 0-2H6Zm11 7.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"
    />
  </Icon>
));
