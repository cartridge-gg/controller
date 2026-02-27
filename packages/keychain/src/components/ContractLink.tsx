import { useConnection } from "@/hooks/connection";
import { Address, cn } from "@cartridge/ui";
import { useExplorer } from "@starknet-react/core";
import { constants } from "starknet";

export function ContractLink({
  contractAddress,
  className,
}: {
  contractAddress: string;
  className?: string;
}) {
  const { controller } = useConnection();
  const explorer = useExplorer();
  return (
    <a
      className={cn(
        "text-foreground-100 cursor-pointer hover:underline",
        className,
      )}
      href={
        controller?.chainId() === constants.StarknetChainId.SN_MAIN ||
        controller?.chainId() === constants.StarknetChainId.SN_SEPOLIA
          ? explorer.contract(contractAddress)
          : `#`
      }
      target="_blank"
      rel="noreferrer"
    >
      <Address
        address={contractAddress}
        first={5}
        last={5}
        className="text-inherit"
      />
    </a>
  );
}
