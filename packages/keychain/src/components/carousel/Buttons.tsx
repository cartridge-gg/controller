import { WedgeLeftIcon, WedgeRightIcon } from "@cartridge/ui";
import { Circle, IconProps } from "@chakra-ui/react";

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
    ? "translucent.lg"
    : "trancludent.md";
  return (
    <Circle
      as="button"
      size={`${active ? size + 2 : size}px`}
      bgColor={color}
      onClick={onClick}
    />
  );
};

export const Prev = (props: NavProps) => (
  <NavBtn {...props} Icon={WedgeLeftIcon} />
);

export const Next = (props: NavProps) => (
  <NavBtn {...props} Icon={WedgeRightIcon} />
);

function NavBtn({
  enabled,
  onClick,
  Icon,
}: {
  enabled: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  Icon: React.ComponentType<IconProps>;
}) {
  return (
    <Circle
      as="button"
      size="26px"
      bg="translucent.soft"
      onClick={onClick}
      opacity={enabled ? "1" : "0.3"}
      transition="opacity 0.25s ease"
      pointerEvents={enabled ? "auto" : "none"}
    >
      <Icon color="translucent.lg" />
    </Circle>
  );
}
