import { cn } from "@cartridge/ui";

export const SignerAlert = () => {
  return (
    <div
      className={cn(
        "w-full h-fit py-2 px-3",
        "border border-background-200",
        "rounded-[4px]",
        "flex items-center bg-background-100",
      )}
    >
      <p className="text-destructive-100 text-xs">
        Signers have{" "}
        <span className="font-bold">full access to your wallet and funds</span>.
        Proceed with Caution.
      </p>
    </div>
  );
};
