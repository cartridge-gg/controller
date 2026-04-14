import { AchievementPlayerAvatar, Thumbnail } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

export interface CollectibleItemDetailsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleItemDetailsVariants> {
  owner: string;
  quantity: number;
  price?: string;
  logo?: string;
  expiration?: string;
}

const collectibleItemDetailsVariants = cva(
  "h-10 px-3 py-2.5 rounded flex justify-between items-center gap-2 text-sm w-full overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-background-150",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function CollectibleItemDetails({
  owner,
  quantity,
  price,
  logo,
  expiration,
  variant,
  className,
  ...props
}: CollectibleItemDetailsProps) {
  return (
    <div
      className={cn(collectibleItemDetailsVariants({ variant }), className)}
      {...props}
    >
      <div className="flex gap-1 grow overflow-hidden">
        <AchievementPlayerAvatar
          username={owner}
          size="sm"
          className="min-w-6"
        />
        <p className="text-sm truncate">{owner}</p>
      </div>
      <div className="flex justify-end items-center gap-2 min-w-40 overflow-hidden">
        <p className="min-w-10">{quantity}</p>
        <div className="min-w-14 flex gap-1 items-center">
          {logo && <Thumbnail icon={logo} size="xs" rounded centered />}
          <p className={cn(!price ? "text-foreground-400" : "")}>
            {price || "--"}
          </p>
        </div>
        <p className={cn("min-w-12", !expiration && "text-foreground-400")}>
          {expiration || "--"}
        </p>
      </div>
    </div>
  );
}

export default CollectibleItemDetails;
