import { TabsTrigger } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";

interface CollectibleTabProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleTabVariants> {
  value: string;
  label: string;
  active: boolean;
  Icon?: React.ReactNode;
}

export const collectibleTabVariants = cva(
  "h-10 group select-none rounded-none cursor-pointer flex justify-center items-center border-b px-3 py-2.5 gap-1 grow data-[state=active]:shadow-none data-[state=active]:rounded data-[state=active]:cursor-default data-[state=active]:text-primary data-[state=active]:hover:text-primary transition-colors",
  {
    variants: {
      variant: {
        darkest:
          "bg-background-100 border-background-200 text-foreground-400 hover:text-foreground-200 data-[state=active]:bg-background-200",
        darker:
          "bg-background-100 border-background-200 text-foreground-400 hover:text-foreground-200 data-[state=active]:bg-background-200",
        dark: "bg-background-100 border-background-200 text-foreground-400 hover:text-foreground-200 data-[state=active]:bg-background-200",
        default:
          "bg-background-100 border-background-200 text-foreground-400 hover:text-foreground-200 data-[state=active]:bg-background-200",
        light:
          "bg-background-100 border-background-200 text-foreground-400 hover:text-foreground-200 data-[state=active]:bg-background-200",
        lighter:
          "bg-background-100 border-background-200 text-foreground-400 hover:text-foreground-200 data-[state=active]:bg-background-200",
        lightest:
          "bg-background-100 border-background-200 text-foreground-400 hover:text-foreground-200 data-[state=active]:bg-background-200",
        ghost:
          "border-background-transparent text-foreground-400 hover:text-foreground-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const CollectibleTab = ({
  value,
  label,
  active,
  Icon,
  variant,
  className,
}: CollectibleTabProps) => {
  return (
    <TabsTrigger
      data-state={active ? "active" : "inactive"}
      value={value}
      className={cn(collectibleTabVariants({ variant }), className)}
    >
      {Icon}
      <p className="text-sm font-normal capitalize">{label}</p>
    </TabsTrigger>
  );
};

export default CollectibleTab;
