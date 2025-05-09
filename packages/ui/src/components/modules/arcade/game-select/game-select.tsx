import { CardTitle, SparklesIcon, Thumbnail } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo, HTMLAttributes, useState } from "react";

interface ArcadeGameSelectProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeGameSelectVariants> {
  name: string;
  logo?: string;
  cover?: string;
  points?: number;
  active?: boolean;
}

export const arcadeGameSelectVariants = cva(
  "select-none h-12 flex justify-between items-center p-2 gap-x-3 cursor-pointer data-[active=true]:cursor-default",
  {
    variants: {
      variant: {
        darkest: "bg-background-100 data-[active=true]:bg-background-200",
        darker: "bg-background-100 data-[active=true]:bg-background-200",
        dark: "bg-background-100 data-[active=true]:bg-background-200",
        default: "bg-background-200 data-[active=true]:bg-background-300",
        light: "bg-background-200 data-[active=true]:bg-background-300",
        lighter: "bg-background-200 data-[active=true]:bg-background-300",
        lightest: "bg-background-200 data-[active=true]:bg-background-300",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const ArcadeGameSelect = ({
  name,
  logo,
  cover,
  points,
  active,
  variant,
  className,
  ...props
}: ArcadeGameSelectProps) => {
  const [hover, setHover] = useState(false);

  const style = useMemo(() => {
    const bgColor =
      !variant || variant === "default"
        ? `var(--background-${active ? "300" : "200"})`
        : `var(--background-${active ? "200" : "100"})`;
    const opacity = cover
      ? active || hover
        ? "92%"
        : "96%"
      : active || hover
        ? "25%"
        : "50%";
    const image = cover ? `url(${cover})` : "var(--theme-cover-url)";
    return {
      backgroundImage: `linear-gradient(to right,${bgColor},color-mix(in srgb, ${bgColor} ${opacity}, transparent)),${image}`,
    };
  }, [cover, variant, active, hover]);

  return (
    <div
      data-active={active}
      className={cn(
        arcadeGameSelectVariants({ variant }),
        "bg-top bg-cover bg-no-repeat select-none",
        className,
      )}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      <div className="flex items-center gap-3">
        <Thumbnail
          icon={logo}
          variant={active || hover ? "lightest" : "light"}
        />
        <CardTitle
          className={cn(
            "text-sm font-medium",
            active || hover ? "text-foreground-100" : "text-foreground-200",
          )}
        >
          {name}
        </CardTitle>
      </div>
      {!!points && (
        <ArcadePoints
          label={points.toLocaleString()}
          active={active || hover}
          variant={variant}
        />
      )}
    </div>
  );
};

const arcadePointsVariants = cva(
  "flex items-center gap-x-0.5 rounded-full px-1.5 py-1 cursor-pointer",
  {
    variants: {
      variant: {
        darkest:
          "text-foreground-200 bg-background-100 data-[active=true]:bg-background-200 data-[active=true]:text-foreground-100",
        darker:
          "text-foreground-200 bg-background-100 data-[active=true]:bg-background-200 data-[active=true]:text-foreground-100",
        dark: "text-foreground-200 bg-background-100 data-[active=true]:bg-background-200 data-[active=true]:text-foreground-100",
        default:
          "text-foreground-300 bg-background-200 data-[active=true]:bg-background-300 data-[active=true]:text-foreground-100",
        light:
          "text-foreground-300 bg-background-200 data-[active=true]:bg-background-300 data-[active=true]:text-foreground-100",
        lighter:
          "text-foreground-300 bg-background-200 data-[active=true]:bg-background-300 data-[active=true]:text-foreground-100",
        lightest:
          "text-foreground-300 bg-background-200 data-[active=true]:bg-background-300 data-[active=true]:text-foreground-100",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ArcadePointsProps extends VariantProps<typeof arcadePointsVariants> {
  label?: string;
  active?: boolean;
}

const ArcadePoints = ({ label, active, variant }: ArcadePointsProps) => {
  return (
    <div data-active={active} className={arcadePointsVariants({ variant })}>
      <SparklesIcon variant={active ? "solid" : "line"} size="xs" />
      <p className="px-0.5 text-xs font-medium">{label}</p>
    </div>
  );
};

export default ArcadeGameSelect;
