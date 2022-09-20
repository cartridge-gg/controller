import React from "react";
import { Flex, forwardRef } from "@chakra-ui/react";
import { css } from "@emotion/react";

export const Badge = forwardRef(
  (
    {
      children,
      style,
    }: { children: React.ReactNode; style?: React.CSSProperties },
    ref,
  ) => (
    <Flex
      css={css`
        background-color: #0f1410;
        border-radius: 30px;
        text-transform: uppercase;
        font-family: "LD_Mono";
        font-weight: 600;
        font-size: 14px;
        padding: 8px 10px;
        align-items: center;
      `}
      style={style}
    >
      <span ref={ref}>{children}</span>
    </Flex>
  ),
);
