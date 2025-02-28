import {
  ArrowIcon,
  PaperPlaneIcon,
  SparklesIcon,
  Thumbnail,
  ThumbnailsSubIcon,
} from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import ActivityCard from "./card";
import { formatAddress } from "@cartridge/utils";

const activityTokenCardVariants = cva(
  "rounded p-3 pr-4 flex items-center justify-between gap-4",
  {
    variants: {
      variant: {
        default: "bg-background-200 text-foreground-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ActivityTokenCardProps
  extends VariantProps<typeof activityTokenCardVariants> {
  amount: string;
  address: string;
  value: string;
  image: string;
  action: "send" | "receive" | "mint";
  error?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActivityTokenCard = ({
  amount,
  address,
  value,
  image,
  action,
  error,
  loading,
  variant,
  className,
}: ActivityTokenCardProps) => {
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
        return loading ? "Sending" : "Sent";
      case "receive":
        return loading ? "Receiving" : "Received";
      default:
        return loading ? "Minting" : "Minted";
    }
  }, [loading, action]);

  const Logo = useMemo(
    () => (
      <Thumbnail
        icon={image}
        subIcon={<ThumbnailsSubIcon Icon={Icon} />}
        error={error}
        loading={loading}
        variant={loading || error ? "faded" : undefined}
        size="lg"
        rounded
      />
    ),
    [image, error, loading, Icon],
  );

  const Address = useMemo(() => {
    switch (action) {
      case "send":
        return <p>{`To ${formatAddress(address, { size: "xs" })}`}</p>;
      default:
        return <p>{`From ${formatAddress(address, { size: "xs" })}`}</p>;
    }
  }, [address, action]);

  const Value = useMemo(() => {
    return <p>{value}</p>;
  }, [value]);

  return (
    <ActivityCard
      Logo={Logo}
      title={title}
      subTitle={Address}
      topic={amount}
      subTopic={error ? undefined : Value}
      error={error}
      loading={loading}
      variant={variant}
      className={className}
    />
  );
};

export default ActivityTokenCard;
