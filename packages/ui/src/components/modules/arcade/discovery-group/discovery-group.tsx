import {
  ArcadeDiscoveryEvent,
  ArcadeDiscoveryEventProps,
  ArcadeGameHeader,
  ArcadeGameHeaderProps,
} from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";

interface ArcadeDiscoveryGroupProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeDiscoveryGroupVariants> {
  game: ArcadeGameHeaderProps;
  events: ArcadeDiscoveryEventProps[];
  loading?: boolean;
  rounded?: boolean;
}

export const arcadeDiscoveryGroupVariants = cva(
  "select-none flex flex-col gap-y-px data-[rounded=true]:rounded-lg data-[rounded=true]:overflow-hidden",
  {
    variants: {
      variant: {
        darkest: "",
        darker: "",
        dark: "",
        default: "",
        light: "",
        lighter: "",
        lightest: "",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const ArcadeDiscoveryGroup = ({
  game,
  events,
  loading,
  rounded,
  variant,
  className,
  color,
}: ArcadeDiscoveryGroupProps) => {
  return (
    <div
      data-rounded={rounded}
      className={cn(arcadeDiscoveryGroupVariants({ variant }), className)}
    >
      <ArcadeGameHeader variant={variant} {...game} />
      {events.map((event, index) => (
        <ArcadeDiscoveryEvent
          key={index}
          loading={loading}
          className={className}
          variant={variant}
          color={color}
          {...event}
        />
      ))}
    </div>
  );
};
