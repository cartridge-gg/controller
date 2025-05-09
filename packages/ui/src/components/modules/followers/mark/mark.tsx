import { cva, VariantProps } from "class-variance-authority";
import { UserCheckIcon } from "@/index";
import { cn } from "@/utils";

export const followerMarkVariants = cva(
  "h-6 w-7 flex items-center justify-center rounded hidden data-[active=true]:flex",
  {
    variants: {
      variant: {
        default:
          "text-background-400 group-hover:text-background-500 data-[active=true]:text-foreground-100 data-[active=true]:group-hover:text-foreground-100 transition-colors",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface FollowerMarkProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof followerMarkVariants> {
  active?: boolean;
}

export const FollowerMark = ({
  active,
  variant,
  className,
  ...props
}: FollowerMarkProps) => {
  return (
    <div
      data-active={active}
      className={cn(followerMarkVariants({ variant, className }))}
      {...props}
    >
      <UserCheckIcon variant="solid" size="sm" />
    </div>
  );
};

export default FollowerMark;
