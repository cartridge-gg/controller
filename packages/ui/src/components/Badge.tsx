import { ReactNode, CSSProperties } from "react";
import { Flex, forwardRef } from "@chakra-ui/react";

// Workaround
export const Badge: React.FC<{
  children: ReactNode;
  style?: CSSProperties;
}> = forwardRef(({ children, style }, ref) => (
  <Flex
    style={{
      backgroundColor: "#0f1410",
      borderRadius: "30px",
      textTransform: "uppercase",
      fontFamily: "LD_Mono",
      fontWeight: 600,
      fontSize: "14px",
      padding: "8px 10px",
      alignItems: "center",
      ...style,
    }}
  >
    <span ref={ref}>{children}</span>
  </Flex>
));
