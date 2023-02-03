import { ReactNode } from "react";
import { Circle, HStack } from "@chakra-ui/react";

const Ellipses = ({
  count = 3,
  size = "4px",
  spacing = "3px",
  color = "whiteAlpha.400",
}: {
  count?: number;
  size?: string;
  spacing?: string;
  color?: string;
}) => {
  let circles: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    circles.push(<Circle size={size} bgColor={color} />);
  }
  return <HStack spacing={spacing}>{circles}</HStack>;
};

export default Ellipses;
