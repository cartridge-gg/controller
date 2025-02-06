import { Label, cn } from "@cartridge/ui-next";

type HeaderProps = {
  label?: string;
  className?: string;
};

export function Header({ label = "Amount", className }: HeaderProps) {
  return (
    <Label
      className={cn(
        "py-3 text-xs font-semibold normal-case tracking-wider text-foreground-400",
        className,
      )}
    >
      {label}
    </Label>
  );
}
