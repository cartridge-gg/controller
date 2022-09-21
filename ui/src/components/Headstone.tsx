import { Box, Circle } from "@chakra-ui/react";

type HeadStoneProps = {
  color: string;
  icon: React.ReactNode;
  bgColor?: string;
};

const Headstone = ({ color, icon, bgColor = "gray.600" }: HeadStoneProps) => (
  <Box
    top="0"
    right="50%"
    position="absolute"
    color={color}
    zIndex="-1"
    transform="translate(50%, -50%)"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 144 84"
      height="84px"
      fill="currentColor"
    >
      <path d="M144,84V42h-9.84A25,25,0,0,1,111,26.28a42,42,0,0,0-77.92,0A25,25,0,0,1,9.84,42H0V84Z" />
    </svg>
    <Circle
      size="60px"
      top="12px"
      right="50%"
      position="absolute"
      transform="translate(50%)"
      bgColor={bgColor}
      color={color}
    >
      {icon}
    </Circle>
  </Box>
);

export default Headstone;