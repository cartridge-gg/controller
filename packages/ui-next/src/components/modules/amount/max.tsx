import { Button, cn } from "@cartridge/ui-next";

export type MaxProps = {
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
        "absolute right-2 top-1/2 -translate-y-1/2 text-xs/3 font-bold uppercase px-2 py-1.5 h-7 bg-muted text-foreground hover:opacity-70",
        className,
      )}
      variant="ghost"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
