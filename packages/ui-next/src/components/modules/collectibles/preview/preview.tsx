import { PLACEHOLDER } from "@/assets";
import { cn } from "@/index";
import { cva, VariantProps } from "class-variance-authority";

export interface CollectiblePreviewProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectiblePreviewVariants> {
  image: string;
  hover?: boolean;
}

const collectiblePreviewVariants = cva(
  "relative flex items-center justify-center overflow-hidden shrink-0",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        sm: "p-2 h-[128px]",
        md: "p-2 h-[128px]",
        lg: "p-5 h-[240px] rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const CollectiblePreview = ({
  image,
  hover,
  variant,
  size,
  className,
  ...props
}: CollectiblePreviewProps) => {
  return (
    <div
      className={cn(collectiblePreviewVariants({ variant, size }), className)}
      {...props}
    >
      <div className="absolute grow inset-0">
        <div
          className="bg-center bg-cover blur-[8px] h-full w-full transition-all duration-150"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.64), rgba(0, 0, 0, 0.64)), url(${image}), url(${PLACEHOLDER})`,
            opacity: hover ? 1 : 0.75,
          }}
        />
      </div>
      <img
        data-hover={hover}
        className="object-contain max-h-full max-w-full z-10 transition duration-150 ease-in-out data-[hover=true]:scale-[1.02]"
        draggable={false}
        src={image}
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER;
        }}
      />
    </div>
  );
};

export default CollectiblePreview;
