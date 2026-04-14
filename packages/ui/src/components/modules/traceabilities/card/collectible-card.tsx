import {
  ArrowIcon,
  MoneyIcon,
  PaperPlaneIcon,
  SeedlingIcon,
  TagIcon,
  Thumbnail,
  ThumbnailCollectible,
} from "@/index";
import { VariantProps } from "class-variance-authority";
import { useMemo, useState } from "react";
import TraceabilityCard, { traceabilityCardVariants } from "./card";

export interface TraceabilityCollectibleCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof traceabilityCardVariants> {
  username: string;
  timestamp: number;
  category: "send" | "receive" | "mint" | "sale" | "list";
  collectibleImage: string;
  collectibleName: string;
  currencyImage?: string;
  amount?: number;
  quantity?: number;
  className?: string;
}

export const TraceabilityCollectibleCard = ({
  username,
  timestamp,
  category,
  collectibleImage,
  collectibleName,
  currencyImage,
  amount,
  quantity,
  variant,
  className,
  ...props
}: TraceabilityCollectibleCardProps) => {
  const [hover, setHover] = useState(false);

  const CollectibleIcon = useMemo(
    () => (
      <ThumbnailCollectible
        image={collectibleImage}
        size="xxs"
        className="border-0 p-0"
      />
    ),
    [collectibleImage, hover],
  );

  const CurrencyIcon = useMemo(() => {
    if (!currencyImage) return null;
    return (
      <Thumbnail
        icon={currencyImage}
        size="xxs"
        rounded
        className="border-0 p-0"
      />
    );
  }, [currencyImage, hover]);

  return (
    <TraceabilityCard
      username={username}
      timestamp={timestamp}
      Icon={<CategoryIcon category={category} />}
      variant={variant}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      <>
        <div className="h-6 flex items-center gap-0.5 bg-translucent-dark-100 p-1 rounded overflow-hidden">
          {CollectibleIcon}
          <p className="text-xs text-foreground-100 px-0.5 truncate overflow-hidden">
            {quantity ? `${quantity} ${collectibleName}` : collectibleName}
          </p>
        </div>
        {amount !== undefined && (
          <div className="flex items-center gap-0.5 bg-translucent-dark-100 p-1 rounded">
            {CurrencyIcon}
            <div className="text-xs text-foreground-100 px-0.5 w-full">
              {amount.toLocaleString()}
            </div>
          </div>
        )}
      </>
    </TraceabilityCard>
  );
};

const CategoryIcon = ({
  category,
}: { category: "mint" | "receive" | "send" | "sale" | "list" }) => {
  switch (category) {
    case "mint":
      return <SeedlingIcon variant="solid" size="xs" />;
    case "receive":
      return <ArrowIcon variant="down" size="xs" />;
    case "send":
      return <PaperPlaneIcon variant="solid" size="xs" />;
    case "sale":
      return <MoneyIcon variant="solid" size="xs" />;
    case "list":
      return <TagIcon variant="solid" size="xs" />;
  }
};

export default TraceabilityCollectibleCard;
