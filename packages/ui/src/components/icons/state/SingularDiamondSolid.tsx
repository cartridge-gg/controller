import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const SingularDiamondSolidIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M11.975 4.99a.565.565 0 0 0-.274.086l-7.109 6.447a.563.563 0 0 0 0 .956l7.11 6.446a.563.563 0 0 0 .597 0l7.108-6.446a.563.563 0 0 0 .001-.956l-7.109-6.447a.56.56 0 0 0-.324-.087Z"
    />
  </Icon>
));
