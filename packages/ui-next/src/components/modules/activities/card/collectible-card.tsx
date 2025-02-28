import {
  ArrowIcon,
  PaperPlaneIcon,
  SparklesIcon,
  ThumbnailCollectible,
  ThumbnailsSubIcon,
} from "@/index";
import { VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import ActivityCard, { activityCardVariants } from "./card";
import { formatAddress } from "@cartridge/utils";

export interface ActivityCollectibleCardProps
  extends VariantProps<typeof activityCardVariants> {
  name: string;
  address: string;
  collection: string;
  image: string;
  action: "send" | "receive" | "mint";
  error?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActivityCollectibleCard = ({
  name,
  address,
  collection,
  image,
  action,
  error,
  loading,
  variant,
  className,
}: ActivityCollectibleCardProps) => {
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
      <ThumbnailCollectible
        image={image}
        subIcon={<ThumbnailsSubIcon Icon={Icon} />}
        error={error}
        loading={loading}
        variant={loading || error ? "faded" : undefined}
        size="lg"
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

  const Collection = useMemo(() => {
    return <p>{collection}</p>;
  }, [collection]);

  return (
    <ActivityCard
      Logo={Logo}
      title={title}
      subTitle={Address}
      topic={name}
      subTopic={Collection}
      error={error}
      loading={loading}
      variant={variant}
      className={className}
    />
  );
};

export default ActivityCollectibleCard;
