import { cn } from "@cartridge/ui-next";

type BalanceProps = {
  value: number;
  symbol: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export function Balance({
  value,
  symbol,
  className,
  onClick = () => {},
}: BalanceProps) {
  return (
    <div
      className={cn(
        "text-xs uppercase font-medium text-foreground-100 cursor-pointer",
        "hover:underline",
        className,
      )}
      onClick={onClick}
    >
      {`${value.toLocaleString()} ${symbol}`}
    </div>
  );
}
