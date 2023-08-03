import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const ArrowLineDownIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M18 20a.855.855 0 0 0 .857-.857.855.855 0 0 0-.857-.857H6a.855.855 0 0 0-.857.857c0 .475.382.857.857.857h12Zm-6.625-4.843a.855.855 0 0 0 1.25 0l4.571-4.857a.857.857 0 0 0-1.246-1.175l-3.093 3.286V4.857A.855.855 0 0 0 12 4a.855.855 0 0 0-.857.857v7.554l-3.09-3.282a.857.857 0 0 0-1.246 1.175l4.572 4.857-.004-.004Z"
    />
  </Icon>
));
