import {
  ArrowIcon,
  PaperPlaneIcon,
  SparklesIcon,
  Thumbnail,
  ThumbnailsSubIcon,
} from "@/index";
import { VariantProps } from "class-variance-authority";
import { useMemo, useState } from "react";
import ActivityCard, { activityCardVariants } from "./card";
import { formatAddress } from "@cartridge/ui/utils";

export interface ActivityTokenCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof activityCardVariants> {
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
  ...props
}: ActivityTokenCardProps) => {
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
        rounded
      />
    ),
    [image, error, loading, hover, Icon],
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
      subTopic={Value}
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

export default ActivityTokenCard;
