import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const ArrowLineRightIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M20 6a.855.855 0 0 0-.857-.857.855.855 0 0 0-.857.857v12c0 .475.382.857.857.857A.855.855 0 0 0 20 18V6Zm-4.843 6.625a.855.855 0 0 0 0-1.25L10.3 6.804A.857.857 0 0 0 9.125 8.05l3.286 3.093H4.857A.855.855 0 0 0 4 12c0 .475.382.857.857.857h7.554l-3.282 3.09a.857.857 0 0 0 1.175 1.246l4.857-4.572-.004.004Z"
    />
  </Icon>
));
