import { cn } from "@cartridge/ui-next";

export type BalanceProps = {
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
        "text-[11px]/3 uppercase font-bold cursor-pointer hover:opacity-90",
        className,
      )}
      onClick={onClick}
    >
      {`${value} ${symbol}`}
    </div>
  );
}
