import React from "react";
import { Circle } from "@chakra-ui/react";

import Chevron from "../icons/Chevron";

export type DotBtnProps = {
  active: boolean;
  diff: number;
  onClick: () => void;
};

export type NavBtnProps = {
  isNext: boolean;
  disabled: boolean;
  onClick: () => void;
};
export const DotBtn = ({ active, diff, onClick }: DotBtnProps) => {
  const color = active
    ? "white"
    : diff == 1
    ? "whiteAlpha.600"
    : "whiteAlpha.400";
  return (
    <Circle
      as="button"
      size={active ? "7px" : "5px"}
      bgColor={color}
      onClick={onClick}
    ></Circle>
  );
};

export const NavBtn = ({ isNext, onClick, disabled }: NavBtnProps) => (
  <Circle
    as="button"
    position="absolute"
    right={isNext ? "10px" : "0"}
    left={!isNext ? "10px" : "0"}
    transform="translateY(-50%)"
    top="50%"
    size="26px"
    bgColor="whiteAlpha.300"
    onClick={onClick}
    opacity={disabled ? "0" : "1"}
    transition="opacity 0.25s ease"
  >
    {isNext ? (
      <Chevron color="whiteAlpha.600" />
    ) : (
      <Chevron direction="left" color="whiteAlpha.600" />
    )}
  </Circle>
);
