import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const GemLineIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M7.999 5a.498.498 0 0 0-.41.213l-3.5 5a.504.504 0 0 0 .044.628l7.5 8a.501.501 0 0 0 .732 0l7.5-8a.496.496 0 0 0 .043-.628l-3.5-5a.498.498 0 0 0-.41-.213h-8Zm.028 1.334L10.958 10h-5.5l2.569-3.666ZM5.652 11h12.694l-6.347 6.769L5.652 11Zm12.884-1h-5.5l2.935-3.666L18.539 10h-.003Zm-3.578-4-2.96 3.7L9.04 6h5.92Z"
    />
  </Icon>
));
