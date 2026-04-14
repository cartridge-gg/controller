import { useMemo, useState } from "react";
import {
  ArrowIcon,
  ThumbnailCollectible,
  PaperPlaneIcon,
  SeedlingIcon,
  FireIcon,
  TagIcon,
  MoneyIcon,
  ActivityPreposition,
  AchievementPlayerAvatar,
  WalletIcon,
  Thumbnail,
  CollectibleTag,
} from "@/index";
import { VariantProps } from "class-variance-authority";
import ActivityCardRow, { activityCardRowVariants } from "./card-row";
import { formatAddress } from "@/utils";

export interface ActivityCollectibleCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof activityCardRowVariants> {
  name: string;
  address: string; // token address
  username?: string; // token owner username
  collection?: string;
  image?: string; // token image
  logo?: string; // game logo
  orderAmount?: string; // order amount
  orderImage?: string; // order token image
  orderSymbol?: string; // order token symbol (if no image)
  action: "send" | "receive" | "mint" | "burn" | "list" | "sell";
  timestamp: number;
  error?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActivityCollectibleCard = ({
  name,
  address,
  username,
  collection,
  image,
  logo,
  orderAmount,
  orderImage,
  orderSymbol,
  action: actionProp,
  timestamp,
  error,
  loading,
  variant,
  className,
  ...props
}: ActivityCollectibleCardProps) => {
  const [_hover, setHover] = useState(false);

  const action = useMemo(
    () =>
      actionProp === "receive" && BigInt(address) == 0n
        ? "mint"
        : actionProp === "send" && BigInt(address) == 0n
          ? "burn"
          : actionProp,
    [actionProp, address],
  );

  const Icon = useMemo(() => {
    switch (action) {
      case "send":
        return <PaperPlaneIcon variant="solid" className="w-full h-full" />;
      case "receive":
        return <ArrowIcon variant="down" className="w-full h-full" />;
      case "mint":
        return <SeedlingIcon variant="solid" className="w-full h-full" />;
      case "burn":
        return <FireIcon variant="solid" className="w-full h-full" />;
      case "list":
        return <TagIcon variant="solid" className="w-full h-full" />;
      case "sell":
        return <MoneyIcon variant="solid" className="w-full h-full" />;
      default:
        return undefined;
    }
  }, [action]);

  const TokenImage = useMemo(
    () => (
      <ThumbnailCollectible
        image={image ?? ""}
        variant="ghost"
        size="sm"
        className="flex-none"
      />
    ),
    [image],
  );

  const Token = useMemo(() => {
    return (
      <CollectibleTag
        variant="dark"
        className="gap-1 shrink min-w-0 text-inherit"
      >
        {TokenImage}
        <p className="truncate shrink">{name}</p>
      </CollectibleTag>
    );
  }, [TokenImage, name]);

  const Preposition = useMemo(() => {
    switch (action) {
      case "send":
        return <ActivityPreposition label="to" />;
      case "receive":
        return <ActivityPreposition label="from" />;
      case "mint":
        return <ActivityPreposition label="minted" />;
      case "burn":
        return <ActivityPreposition label="burned" />;
      case "list":
      case "sell":
        return <ActivityPreposition label="for" />;
      default:
        return undefined;
    }
  }, [action]);

  const OrderTokenImage = useMemo(
    () =>
      orderImage ? (
        <Thumbnail
          icon={orderImage}
          variant="ghost"
          size="xs"
          className="flex-none"
          rounded
        />
      ) : undefined,
    [orderImage],
  );

  const Subject = useMemo(() => {
    switch (action) {
      case "send":
      case "receive":
        return username ? (
          <CollectibleTag variant="dark" className="gap-1 shrink min-w-0">
            <AchievementPlayerAvatar
              size="xs"
              className="flex-none"
              username={username}
            />
            <p className="truncate">{username}</p>
          </CollectibleTag>
        ) : (
          <CollectibleTag variant="dark" className="gap-1 shrink min-w-0">
            <WalletIcon variant="solid" size="xs" />
            <p className="truncate">{formatAddress(address, { size: "xs" })}</p>
          </CollectibleTag>
        );
      case "list":
      case "sell":
        return (
          <CollectibleTag variant="dark" className="gap-1 shrink">
            {OrderTokenImage}
            <p>{orderAmount!}</p>
            {OrderTokenImage ? undefined : (
              <p>{orderSymbol?.toUpperCase() || "TOKEN"}</p>
            )}
          </CollectibleTag>
        );
      default:
        return undefined;
    }
  }, [address, action]);

  return (
    <ActivityCardRow
      icon={Icon}
      logo={logo}
      items={[Token, Preposition, Subject]}
      timestamp={timestamp}
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

export default ActivityCollectibleCard;
