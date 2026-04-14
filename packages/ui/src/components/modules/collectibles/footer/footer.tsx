import { CollectibleTag, TagIcon, Thumbnail } from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { cn, formatNumber } from "@/utils";

export interface CollectibleFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof CollectibleFooterVariants> {
  title?: string;
  icon?: string | null;
  totalCount?: number;
  listingCount?: number;
}

const CollectibleFooterVariants = cva("w-full h-[48px] p-[12px]", {
  variants: {
    variant: {
      default: "",
      faded: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const CollectibleFooter = ({
  title,
  icon,
  totalCount,
  listingCount,
  variant,
  className,
  ...props
}: CollectibleFooterProps) => {
  return (
    <div
      className={cn(CollectibleFooterVariants({ variant }), className)}
      style={{
        backgroundImage:
          "linear-gradient(0deg, rgba(0, 0, 0, 0.8), transparent)",
      }}
      {...props}
    >
      <div className="flex items-center gap-[6px]">
        {icon !== undefined && (
          <Thumbnail
            className="w-[20px] h-[20px] bg-translucent-light-100"
            variant="light"
            size="sm"
            icon={icon}
          />
        )}
        {!!listingCount && (
          <TagIcon
            className="min-w-[24px] items-center"
            variant="solid"
            size="sm"
          />
        )}
        {!!title && <p className="truncate">{title}</p>}

        <div className="flex-grow" />

        {!!totalCount && (
          <CollectibleTag
            className="bg-translucent-light-100"
            label={`${formatNumber(totalCount)}x`}
          />
        )}
      </div>
    </div>
  );
};

export default CollectibleFooter;
