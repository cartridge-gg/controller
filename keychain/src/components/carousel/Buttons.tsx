import { Circle } from "@chakra-ui/react";

import Chevron from "@cartridge/ui/src/components/icons/Chevron";

export type DotProps = {
  active: boolean;
  diff: number;
  size?: number;
  onClick: () => void;
};

export type NavProps = {
  enabled: boolean;
  onClick: () => void;
};
export const Dot = ({ active, diff, size = 5, onClick }: DotProps) => {
  const color = active
    ? "white"
    : diff == 1
    ? "whiteAlpha.600"
    : "whiteAlpha.400";
  return (
    <Circle
      as="button"
      size={`${active ? size + 2 : size}px`}
      bgColor={color}
      onClick={onClick}
    />
  );
};

export const Prev = ({ onClick, enabled }: NavProps) =>
  navBtn("left", onClick, enabled);

export const Next = ({ onClick, enabled }: NavProps) =>
  navBtn("right", onClick, enabled);

function navBtn(direction, onClick, enabled) {
  return (
    <Circle
      as="button"
      size="26px"
      bgColor="whiteAlpha.300"
      onClick={onClick}
      opacity={enabled ? "1" : "0.3"}
      transition="opacity 0.25s ease"
      pointerEvents={enabled ? "auto" : "none"}
    >
      <Chevron direction={direction} color="whiteAlpha.600" />
    </Circle>
  );
}
