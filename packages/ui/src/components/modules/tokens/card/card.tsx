import { Thumbnail } from "@/index";
import { cn } from "@/utils";
import { VariantProps } from "class-variance-authority";
import { useMemo, useState } from "react";
import {
  ActivityCard,
  activityCardVariants,
} from "@/components/modules/activities/card";

export interface TokenCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof activityCardVariants> {
  image: string | React.ReactNode;
  title: string | React.ReactNode;
  amount: string;
  increasing?: boolean;
  decreasing?: boolean;
  value?: string;
  change?: string;
  clickable?: boolean;
  roundedImage?: boolean;
  isFree?: boolean;
  className?: string;
}

export const TokenCard = ({
  image,
  title,
  amount,
  increasing,
  decreasing,
  value,
  change,
  clickable = true,
  roundedImage = true,
  isFree = false,
  variant,
  className,
  ...props
}: TokenCardProps) => {
  const [hover, setHover] = useState(false);

  const Logo = useMemo(
    () => (
      <Thumbnail
        icon={image}
        size="lg"
        variant={hover ? "lighter" : "light"}
        rounded={roundedImage}
      />
    ),
    [image, hover],
  );

  const style = useMemo(() => {
    if (increasing || change?.includes("+")) {
      return {
        backgroundImage: `linear-gradient(to right,transparent,color-mix(in srgb, var(--constructive-100) 3%, transparent))`,
      };
    }
    if (decreasing || change?.includes("-")) {
      return {
        backgroundImage: `linear-gradient(to right,transparent,color-mix(in srgb, var(--destructive-100) 3%, transparent))`,
      };
    }
    return {};
  }, [change, increasing, decreasing]);

  const Amount = useMemo(() => {
    if (increasing) {
      return <p className="text-constructive-100">+{amount}</p>;
    }
    if (decreasing) {
      return <p className="text-destructive-100">-{amount}</p>;
    }
    return <>{amount}</>;
  }, [amount, increasing, decreasing]);

  const Change = useMemo(() => {
    if (change?.includes("+")) {
      return <p className="text-constructive-100">{change}</p>;
    }
    if (change?.includes("-")) {
      return <p className="text-destructive-100">{change}</p>;
    }
    return <></>;
  }, [change]);

  return (
    <ActivityCard
      Logo={Logo}
      title={title}
      subTitle={Amount}
      topic={value}
      subTopic={Change}
      badge={isFree ? "FREE" : undefined}
      variant={variant}
      className={cn(
        "rounded-none",
        !clickable && "pointer-events-none",
        className,
      )}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    />
  );
};

export default TokenCard;
