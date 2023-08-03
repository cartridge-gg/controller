import { memo } from "react";
import { Icon, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "./types";

export const TimerDuoIcon = memo(
  ({ accent = "brand.accent", ...props }: DuotoneIconProps) => {
    const accentToken = useToken("colors", accent as string);

    return (
      <Icon viewBox="0 0 30 31" {...props}>
        <path
          fill="currentColor"
          fillOpacity=".32"
          d="M13.75 6.75c0-.69.559-1.25 1.25-1.25 5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10a9.978 9.978 0 0 1 3.002-7.143 1.25 1.25 0 1 1 1.748 1.788A7.47 7.47 0 0 0 7.5 15.5 7.48 7.48 0 0 0 15 23a7.502 7.502 0 0 0 1.25-14.896V9.25c0 .691-.559 1.25-1.25 1.25s-1.25-.559-1.25-1.25v-2.5Z"
        />
        <path
          fill={accentToken}
          d="M11.21 11.71c.368-.362.962-.362 1.294 0l3.125 3.126c.398.367.398.96 0 1.293-.332.398-.926.398-1.293 0l-3.125-3.125c-.363-.332-.363-.926 0-1.293Z"
        />
      </Icon>
    );
  },
);
