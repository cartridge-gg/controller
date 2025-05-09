import {
  ArrowIcon,
  PaperPlaneIcon,
  SparklesIcon,
  ThumbnailCollectible,
  ThumbnailsSubIcon,
} from "@/index";
import { VariantProps } from "class-variance-authority";
import { useMemo, useState } from "react";
import TraceabilityCard, { traceabilityCardVariants } from "./card";

export interface TraceabilityCollectibleCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof traceabilityCardVariants> {
  from: string;
  to: string;
  image: string;
  action: "send" | "receive" | "mint";
  amount?: number;
  error?: boolean;
  loading?: boolean;
  className?: string;
}

export const TraceabilityCollectibleCard = ({
  from,
  to,
  amount,
  image,
  action,
  error,
  loading,
  variant,
  className,
  ...props
}: TraceabilityCollectibleCardProps) => {
  const [hover, setHover] = useState(false);

  const Icon = useMemo(() => {
    switch (action) {
      case "send":
        return <PaperPlaneIcon className="w-full h-full" variant="solid" />;
      case "receive":
        return <ArrowIcon variant="down" className="w-full h-full" />;
      default:
        return <SparklesIcon className="w-full h-full" variant="solid" />;
    }
  }, [action]);

  const title = useMemo(() => {
    switch (action) {
      case "send":
      case "receive":
        return loading ? "Transfering" : "Transfer";
      default:
        return loading ? "Minting" : "Mint";
    }
  }, [loading, action]);

  const Logo = useMemo(
    () => (
      <ThumbnailCollectible
        image={image}
        subIcon={
          <ThumbnailsSubIcon
            variant={hover ? "lighter" : "light"}
            Icon={Icon}
          />
        }
        error={error}
        loading={loading}
        variant={hover ? "lighter" : "light"}
        size="lg"
      />
    ),
    [image, error, loading, hover, Icon],
  );

  const { fromAddress, toAddress } = useMemo(() => {
    const fromAddress = `From: ${from}`;
    const toAddress = `To: ${to}`;
    return { fromAddress, toAddress };
  }, [from, to]);

  return (
    <TraceabilityCard
      Logo={Logo}
      title={title}
      count={amount}
      from={fromAddress}
      to={toAddress}
      error={error}
      loading={loading}
      variant={variant}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    />
  );
};

export default TraceabilityCollectibleCard;
