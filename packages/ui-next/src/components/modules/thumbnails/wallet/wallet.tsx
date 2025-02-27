import {
  ArgentIcon,
  BraavosIcon,
  cn,
  ControllerIcon,
  OpenZeppelinIcon,
  WalletIcon,
} from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";

const thumbnailWalletVariants = cva(
  "rounded-full aspect-square flex items-center justify-center p-1",
  {
    variants: {
      variant: {
        default: "bg-background-300 text-foreground-100",
      },
      size: {
        default: "w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ThumbnailWalletProps
  extends VariantProps<typeof thumbnailWalletVariants> {
  brand: "argentx" | "braavos" | "openzeppelin" | "controller" | undefined;
  className?: string;
}

export const ThumbnailWallet = ({
  brand,
  variant,
  size,
  className,
}: ThumbnailWalletProps) => {
  const Icon = useMemo(() => {
    switch (brand) {
      case "argentx":
        return <ArgentIcon size="lg" />;
      case "braavos":
        return <BraavosIcon size="lg" />;
      case "openzeppelin":
        return <OpenZeppelinIcon size="lg" />;
      case "controller":
        return <ControllerIcon size="lg" />;
      default:
        return <WalletIcon variant="solid" size="lg" />;
    }
  }, [brand]);

  return (
    <div className={cn(thumbnailWalletVariants({ variant, size }), className)}>
      {Icon}
    </div>
  );
};

export default ThumbnailWallet;
