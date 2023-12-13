import { EthereumIcon, Loading } from "@cartridge/ui";
import { Button, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { constants, uint256 } from "starknet";
import { CONTRACT_ETH } from "@cartridge/controller/src/constants";
import { BigNumber, utils } from "ethers";
import { providers } from "@cartridge/controller";

// TODO: Round to specific digits so that width doesn't change?
export function EthBalance({
  chainId,
  address,
}: {
  chainId: constants.StarknetChainId;
  address: string;
}) {
  const ethBalance = useEthBalance({ address, chainId });

  return (
    <Button
      size="xs"
      leftIcon={<EthereumIcon boxSize={4} />}
      fontFamily="Inter"
    >
      {typeof ethBalance === undefined ? (
        <Loading />
      ) : (
        <Text>{parseFloat(ethBalance).toFixed(3)}</Text>
      )}
    </Button>
  );
}

export function useEthBalance({
  address,
  chainId,
}: {
  address: string;
  chainId: constants.StarknetChainId;
}) {
  const [ethBalance, setEthBalance] = useState<string>("0");

  useEffect(() => {
    if (address) {
      const provider = providers[chainId];

      provider
        .callContract({
          contractAddress: CONTRACT_ETH,
          entrypoint: "balanceOf",
          calldata: [BigNumber.from(address).toString()],
        })
        .then((res) => {
          setEthBalance(
            utils.formatEther(
              uint256
                .uint256ToBN({
                  low: res.result[0],
                  high: res.result[1],
                })
                .toString(),
            ),
          );
        });
    }
  }, [address, chainId]);

  return ethBalance;
}
