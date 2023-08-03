import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const WalletLineIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M18.5 5a.5.5 0 0 1 0 1h-12A1.5 1.5 0 0 0 5 7.5v9A1.5 1.5 0 0 0 6.5 18h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 17.5 8h-10a.501.501 0 0 1-.5-.5c0-.275.225-.5.5-.5h10A2.5 2.5 0 0 1 20 9.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9A2.5 2.5 0 0 1 6.5 5h12Zm-3.25 8c0-.416.334-.75.75-.75s.75.334.75.75-.334.75-.75.75a.748.748 0 0 1-.75-.75Z"
    />
  </Icon>
));
