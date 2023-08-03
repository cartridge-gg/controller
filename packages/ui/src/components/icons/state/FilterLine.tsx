import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const FilterLineIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M4 6.235C4 5.553 4.553 5 5.235 5h13.53a1.235 1.235 0 0 1 .95 2.023L14 13.93v4.01a1.06 1.06 0 0 1-1.71.837l-1.902-1.484a.993.993 0 0 1-.388-.788v-2.575L4.284 7.023A1.235 1.235 0 0 1 4 6.235ZM5.235 6a.235.235 0 0 0-.18.385l5.83 7.046a.5.5 0 0 1 .115.319v2.756l1.878 1.482c.038.009.05.012.063.012.034 0 .059-.025.059-.06v-4.19a.5.5 0 0 1 .116-.319l5.83-7.046A.236.236 0 0 0 18.766 6H5.236Z"
    />
  </Icon>
));
