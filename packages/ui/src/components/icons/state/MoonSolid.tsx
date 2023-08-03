import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const MoonSolidIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M13.122 4C8.712 4 5.14 7.582 5.14 12s3.572 8 7.982 8a7.954 7.954 0 0 0 5.565-2.264.57.57 0 0 0-.497-.972c-.35.061-.707.093-1.075.093-3.46 0-6.268-2.814-6.268-6.286a6.284 6.284 0 0 1 3.19-5.475.57.57 0 0 0-.236-1.064 8.553 8.553 0 0 0-.679-.028V4Z"
    />
  </Icon>
));
