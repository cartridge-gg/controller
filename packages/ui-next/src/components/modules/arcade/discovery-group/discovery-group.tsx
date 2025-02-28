import {
  ArcadeDiscoveryEvent,
  ArcadeDiscoveryEventProps,
  ArcadeGameHeader,
  ArcadeGameHeaderProps,
  cn,
} from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";

interface ArcadeDiscoveryGroupProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeDiscoveryGroupVariants> {
  game: ArcadeGameHeaderProps;
  events: ArcadeDiscoveryEventProps[];
}

export const arcadeDiscoveryGroupVariants = cva(
  "select-none flex flex-col gap-y-px",
  {
    variants: {
      variant: {
        default: "",
        faded: "",
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
  variant,
}: ArcadeDiscoveryGroupProps) => {
  return (
    <div className={cn(arcadeDiscoveryGroupVariants({ variant }))}>
      <ArcadeGameHeader variant={variant} {...game} />
      {events.map((event, index) => (
        <ArcadeDiscoveryEvent key={index} variant={variant} {...event} />
      ))}
    </div>
  );
};
