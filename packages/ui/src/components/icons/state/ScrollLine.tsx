import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const ScrollLineIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M20 14h-2V8.5C18 6.57 16.431 5 14.5 5h-9A2.503 2.503 0 0 0 3 7.5V10c0 .55.45 1 1 1h3v5a2.997 2.997 0 0 0 2.832 2.984l7.75.016A3.42 3.42 0 0 0 21 15.581V15c0-.55-.45-1-1-1ZM7 10H4V7.5a1.5 1.5 0 0 1 3 0V10Zm5 6c0 1.102-.898 2-2 2-1.102 0-2-.898-2-2V7.5c0-.563-.216-1.082-.5-1.5h7C15.878 6 17 7.121 17 8.5V14h-4c-.55 0-1 .45-1 1v1Zm8-.419A2.42 2.42 0 0 1 17.581 18H12.22A2.974 2.974 0 0 0 13 16v-1h7v.581Z"
    />
  </Icon>
));
