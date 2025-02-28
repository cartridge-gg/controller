import {
  ArgentIcon,
  BraavosIcon,
  ControllerIcon,
  OpenZeppelinIcon,
  WalletIcon,
} from "@/index";
import { VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { Thumbnail, thumbnailVariants } from "../thumbnail";

export interface ThumbnailWalletProps
  extends VariantProps<typeof thumbnailVariants> {
  brand?: "argentx" | "braavos" | "openzeppelin" | "controller" | undefined;
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
        return <ArgentIcon className="w-full h-full" />;
      case "braavos":
        return <BraavosIcon className="w-full h-full" />;
      case "openzeppelin":
        return <OpenZeppelinIcon className="w-full h-full" />;
      case "controller":
        return <ControllerIcon className="w-full h-full" />;
      default:
        return <WalletIcon variant="solid" className="w-full h-full" />;
    }
  }, [brand]);

  return (
    <Thumbnail
      icon={Icon}
      variant={variant}
      size={size}
      className={className}
      rounded
      centered
    />
  );
};

export default ThumbnailWallet;
