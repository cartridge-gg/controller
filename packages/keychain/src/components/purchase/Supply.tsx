import { TagIcon } from "@cartridge/ui";

export type SupplyProps = {
  amount: number;
};

export function Supply({ amount }: SupplyProps) {
  const color = amount <= 0 ? "text-destructive-100" : "text-primary-100";

  return (
    <div
      className={`flex gap-1 py-[2px] px-[8px] rounded-full bg-background-200 text-sm font-semibold ${color}`}
    >
      {amount > 0 ? (
        <>
          <TagIcon size="sm" variant="solid" /> {amount} left
        </>
      ) : (
        <>Out of stock</>
      )}
    </div>
  );
}
