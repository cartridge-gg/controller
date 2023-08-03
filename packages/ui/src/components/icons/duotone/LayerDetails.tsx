import { memo } from "react";
import { Icon, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "./types";

export const LayerDetailsDuoIcon = memo(
  ({ accent = "brand.accent", ...props }: DuotoneIconProps) => {
    const accentToken = useToken("colors", accent as string);

    return (
      <Icon viewBox="0 0 30 31" {...props}>
        <path
          fill={accentToken}
          d="M14.184 6.792a1.942 1.942 0 0 1 1.632 0l7.59 3.507a.83.83 0 0 1 .483.757.83.83 0 0 1-.483.757l-7.59 3.506c-.517.24-1.115.24-1.632 0l-7.59-3.507a.834.834 0 0 1 0-1.514l7.59-3.506Z"
        />
        <path
          fill="currentColor"
          fillOpacity=".32"
          d="m21.559 18.333 1.847.855a.83.83 0 0 1 .483.757.83.83 0 0 1-.483.756l-7.59 3.507c-.517.24-1.115.24-1.632 0l-7.59-3.507a.834.834 0 0 1 0-1.514l1.847-.854 5.278 2.438c.812.375 1.75.375 2.562 0l5.278-2.438Z"
        />
        <path
          fill="currentColor"
          fillOpacity=".32"
          d="m16.281 16.326 5.278-2.437 1.847.854a.83.83 0 0 1 .483.757.83.83 0 0 1-.483.757l-7.59 3.507c-.517.24-1.115.24-1.632 0l-7.59-3.507a.834.834 0 0 1 0-1.514l1.847-.854 5.278 2.437c.812.375 1.75.375 2.562 0Z"
        />
      </Icon>
    );
  },
);
