import { ReactNode } from "react";
import {
  Box,
  Spacer,
  Text,
  StyleProps,
  useStyleConfig,
} from "@chakra-ui/react";

export function Card(props: any) {
  const { variant, ...rest } = props;
  const styles = useStyleConfig("Card", props);

  // Pass the computed styles into the `__css` prop
  return <Box __css={styles} {...rest} />;
}

export const Overlay = ({
  displayOnHover,
  name,
  children,
}: {
  displayOnHover?: boolean;
  name: string;
  children?: ReactNode;
}) => (
  <Box
    top={0}
    bottom={0}
    left={0}
    right={0}
    display="flex"
    flexDir="column"
    position="absolute"
    p="16px"
    bg="linear-gradient(360deg, #000 0%, rgba(0,0,0,0) 60%)"
    _hover={{
      color: "brand",
      opacity: "1",
    }}
    transition="all 0.5s ease"
    opacity={`${displayOnHover ? 0 : "1"}`}
    color="white"
  >
    <Box
      h="full"
      w="full"
      bottom="0"
      left="0"
      position="absolute"
      borderRadius="8px"
      transition="all 0.5s ease"
      _hover={{
        border: "1px solid #FBCB4A",
        boxShadow: "0px 0px 10px #FBCB4A",
        bgColor: "rgb(251, 203, 74, 0.2)",
      }}
    />
    <Spacer />
    <Text
      fontWeight="bold"
      variant="ld-mono-upper"
      color="inherit"
      transition="color 0.5s ease"
      pointerEvents="none"
    >
      {name}
    </Text>
  </Box>
);

export const Arrow = ({
  placement = "bottom",
  size = 12,
  color,
}: {
  placement?: string;
  color?: string;
  size?: number;
}) => (
  <Box
    w="full"
    h="full"
    top="0"
    left="0"
    position="absolute"
    pointerEvents="none"
    _before={{
      content: '""',
      position: "absolute",
      bgColor: color,
      ...arrowStyles(placement, size),
    }}
  />
);

const arrowStyles = (
  placement: string,
  size: number,
): StyleProps | undefined => {
  switch (placement) {
    case "bottom":
      return {
        bottom: 0,
        left: "50%",
        width: `${size * 3}px`,
        height: `${size}px`,
        transform: "translate(-50%, 100%)",
        clipPath: "polygon(50% 100%, 0 0, 100% 0)",
      };
    case "top":
      return {
        top: 0,
        left: "50%",
        width: `${size * 3}px`,
        height: `${size}px`,
        transform: "translate(-50%, -100%)",
        clipPath: "polygon(50% 0, 0 100%, 100% 100%)",
      };
    case "right":
      return {
        top: "50%",
        right: 0,
        width: `${size}px`,
        height: `${size * 3}px`,
        transform: "translate(100%, -50%)",
        clipPath: "polygon(100% 50%, 0 0, 0 100%)",
      };
    case "left":
      return {
        top: "50%",
        left: 0,
        width: `${size}px`,
        height: `${size * 3}px`,
        transform: "translate(-100%, -50%)",
        clipPath: "polygon(0% 50%, 100% 0, 100% 100%)",
      };
  }
};
