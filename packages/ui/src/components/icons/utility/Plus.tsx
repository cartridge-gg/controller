import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const PlusIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M13.923 20v-6.288H20V10.32h-6.077V4h-3.846v6.321H4v3.39h6.077V20h3.846Z"
    />
  </Icon>
));
