import { Button } from "@/index";
import { cn } from "@/utils";

type MaxProps = {
  label?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

export function Max({
  label = "Max",
  onClick = () => {},
  className,
}: MaxProps) {
  return (
    <Button
      className={cn(
        "px-2.5 py-1.5 h-7 rounded bg-background-400 text-foreground-100 text-xs font-semibold tracking-wider normal-case hover:bg-background-500 shadow-none font-sans",
        className,
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
