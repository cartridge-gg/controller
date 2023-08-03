import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const HamburgerIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M4 6.286c0-.474.384-.858.857-.858h14.286a.856.856 0 1 1 0 1.715H4.857A.856.856 0 0 1 4 6.286ZM4 12c0-.475.384-.857.857-.857h14.286c.475 0 .857.382.857.857a.855.855 0 0 1-.857.857H4.857A.856.856 0 0 1 4 12Zm15.143 6.571H4.857a.856.856 0 1 1 0-1.714h14.286c.475 0 .857.382.857.857a.855.855 0 0 1-.857.857Z"
    />
  </Icon>
));
