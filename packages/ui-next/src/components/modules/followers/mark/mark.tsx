import { cva, VariantProps } from "class-variance-authority";
import { cn, UserAddIcon, UserCheckIcon } from "@/index";

export const followerMarkVariants = cva(
  "h-6 w-7 flex items-center justify-center rounded",
  {
    variants: {
      variant: {
        default:
          "border border-background-300 group-hover:border-background-400 text-background-400 group-hover:text-background-500 data-[active=true]:text-foreground-100 data-[active=true]:group-hover:text-foreground-100 transition-colors",
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
      {active ? (
        <UserCheckIcon variant="line" size="sm" />
      ) : (
        <UserAddIcon variant="line" size="sm" />
      )}
    </div>
  );
};

export default FollowerMark;
