import { useConnection } from "@/hooks/connection";
import {
  Address,
  AdvancedDetails,
  AdvancedLink,
  cn,
} from "@cartridge/controller-ui";
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
  const isSupportedChain =
    controller?.chainId() === constants.StarknetChainId.SN_MAIN ||
    controller?.chainId() === constants.StarknetChainId.SN_SEPOLIA;
  const address = (
    <Address
      address={contractAddress}
      first={5}
      last={5}
      className="text-inherit font-sans"
    />
  );

  return (
    <AdvancedDetails>
      <AdvancedLink
        className={cn(
          "text-foreground-100 cursor-pointer hover:underline",
          className,
        )}
        href={isSupportedChain ? explorer.contract(contractAddress) : undefined}
        fallback={address}
        target="_blank"
        rel="noreferrer"
      >
        {address}
      </AdvancedLink>
    </AdvancedDetails>
  );
}
