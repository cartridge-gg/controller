import { Label } from "@/index";
import { cn } from "@/utils";

type HeaderProps = {
  label?: string;
  className?: string;
};

export function Header({ label = "Amount", className }: HeaderProps) {
  return (
    <Label
      className={cn(
        "py-3 text-xs font-semibold normal-case tracking-wider text-foreground-400 select-none",
        className,
      )}
    >
      {label}
    </Label>
  );
}
