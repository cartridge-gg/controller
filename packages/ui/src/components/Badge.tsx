import { ReactNode, CSSProperties } from "react";
import { Flex, forwardRef } from "@chakra-ui/react";
import { css } from "@emotion/react";

// Workaround
export const Badge: React.FC<{
  children: ReactNode;
  style?: CSSProperties;
}> = forwardRef(({ children, style }, ref) => (
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
));
