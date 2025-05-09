import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ExternalIcon,
} from "@/index";
import { formatAddress, StarkscanUrl } from "@cartridge/ui/utils";
import { constants } from "starknet";
import { ERC20Token } from "./types";

interface PublicChainProps {
  isPublicChain: true;
  chainId: constants.StarknetChainId; // Required when isPublicChain is true
}

interface PrivateChainProps {
  isPublicChain?: false;
  chainId?: constants.StarknetChainId; // Optional when isPublicChain is false
}

// Union type for props
export type ERC20DetailProps = {
  token: ERC20Token;
} & (PublicChainProps | PrivateChainProps);

export const ERC20Detail = ({
  token,
  isPublicChain = false,
  chainId,
}: ERC20DetailProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-xs">Details</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <p className="text-foreground-300 font-normal text-sm">
          Contract Address
        </p>
        {isPublicChain && chainId ? (
          <a
            href={`${StarkscanUrl(chainId).contract(token.metadata.address)} `}
            className="flex items-center gap-1 text-sm"
            target="_blank"
          >
            <p className="font-medium">
              {formatAddress(token.metadata.address, {
                size: "sm",
                first: 4,
                last: 4,
              })}
            </p>
            <ExternalIcon size="sm" />
          </a>
        ) : (
          <p>{formatAddress(token.metadata.address, { first: 4, last: 4 })}</p>
        )}
      </CardContent>

      <CardContent className="flex items-center justify-between">
        <p className="text-foreground-300 font-normal text-sm">
          Token Standard
        </p>
        <p className="font-medium text-sm text-foreground-100">ERC-20</p>
      </CardContent>
    </Card>
  );
};
