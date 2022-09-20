import React from "react";
import { Icon, IconProps } from "@chakra-ui/react";

const Chevron = ({
  direction,
  ...rest
}: IconProps & {
  direction?: string;
}) => {
  let rotate = 0;
  if (direction) {
    switch (direction) {
      case "up":
        rotate = -90;
        break;
      case "down":
        rotate = 90;
        break;
      case "left":
        rotate = 180;
        break;
    }
  }

  return (
    <Icon
      w="6px"
      h="10px"
      viewBox="0 0 6 10"
      fill="currentColor"
      transform={`rotate(${rotate}deg)`}
      {...rest}
    >
      <path d="M5.85704 5.00033C5.85704 5.18309 5.78729 5.36594 5.64778 5.50522L1.36226 9.79075C1.08325 10.0698 0.631265 10.0698 0.352259 9.79075C0.073254 9.51174 0.073254 9.05975 0.352259 8.78075L4.1339 5.00033L0.352817 1.21925C0.0738115 0.940248 0.0738115 0.48826 0.352817 0.209254C0.631822 -0.0697513 1.08381 -0.0697514 1.36282 0.209254L5.64834 4.49478C5.78784 4.63428 5.85704 4.81731 5.85704 5.00033Z" />
    </Icon>
  );
};

export default Chevron;
