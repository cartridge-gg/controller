import { memo } from "react";
import { Icon, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "./types";

export const PlugNewDuoIcon = memo(
  ({ accent = "brand.accent", ...props }: DuotoneIconProps) => {
    const accentToken = useToken("colors", accent as string);

    return (
      <Icon viewBox="0 0 30 31" {...props}>
        <path
          fill="currentColor"
          fillOpacity=".32"
          d="M9.333 10.166H6.667v-4a1.333 1.333 0 0 1 2.666 0v4Zm8 0h-2.666v-4a1.333 1.333 0 1 1 2.666 0v4ZM4 12.833c0-.738.597-1.333 1.333-1.333h13.334a1.332 1.332 0 0 1 1.304 1.616c-3.063.846-5.304 3.704-5.304 7.05 0 .475.046.938.129 1.388-.458.212-.95.375-1.463.479v4.133h-2.666v-4.133c-3.043-.654-5.334-3.308-5.334-6.533v-1.334A1.333 1.333 0 0 1 4 12.833Z"
        />
        <path
          fill={accentToken}
          d="M28 20.166c0 3.313-2.688 6-6 6-3.313 0-6-2.687-6-6 0-3.312 2.688-6 6-6 3.313 0 6 2.688 6 6Zm-6.667-2.704v2h-2c-.366 0-.666.338-.666.667 0 .404.3.666.666.666h2v2c0 .405.3.667.667.667a.646.646 0 0 0 .667-.667v-2h2a.646.646 0 0 0 .666-.666c0-.33-.3-.667-.666-.667h-2v-2c0-.33-.3-.667-.667-.667-.367 0-.667.338-.667.667Z"
        />
      </Icon>
    );
  },
);
