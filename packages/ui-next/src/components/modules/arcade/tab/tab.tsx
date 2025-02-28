import { cn, TabsTrigger } from "@/index";
import { cva, VariantProps } from "class-variance-authority";

const arcadeTabVariants = cva(
  "p-0 flex flex-col items-center cursor-pointer select-none transition-colors",
  {
    variants: {
      variant: {
        default: "",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ArcadeTabProps extends VariantProps<typeof arcadeTabVariants> {
  Icon: React.ReactNode;
  value: string;
  label: string;
  active?: boolean;
  className?: string;
}

export const ArcadeTab = ({
  Icon,
  value,
  label,
  active,
  className,
  variant,
}: ArcadeTabProps) => {
  return (
    <TabsTrigger
      value={value}
      className={cn(arcadeTabVariants({ variant }), className)}
    >
      <div
        data-active={active}
        className="px-4 pt-3 pb-[18px] flex justify-center items-center gap-2 text-foreground-300 hover:text-foreground-200 data-[active=true]:text-primary transition-colors"
      >
        {Icon}
        <p className="text-base/5 font-normal tracking-wider">{label}</p>
      </div>
      <div
        data-active={active}
        className={cn(
          "rounded-full bg-primary h-0.5 w-full translate-y-[1px] text-primary",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </TabsTrigger>
  );
};

export default ArcadeTab;
