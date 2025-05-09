import { CollectiblePreview } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { CollectibleHeader } from "../header";
import { useState } from "react";

export interface CollectibleCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleCardVariants> {
  title: string;
  image: string;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

const collectibleCardVariants = cva(
  "grow rounded overflow-hidden cursor-pointer border-transparent border-[2px] data-[selected=true]:border-foreground-100",
  {
    variants: {
      variant: {
        default: "",
        faded: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function CollectibleCard({
  title,
  image,
  selectable = true,
  selected,
  onSelect,
  variant,
  className,
  ...props
}: CollectibleCardProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      data-selected={selected}
      className={cn(collectibleCardVariants({ variant }), className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      <CollectibleHeader
        title={title}
        selectable={!selected && selectable}
        selected={selected}
        onSelect={onSelect}
        hover={hover}
        variant={variant}
      />
      <CollectiblePreview image={image} hover={hover} size="sm" />
    </div>
  );
}

export default CollectibleCard;
