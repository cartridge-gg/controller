import { EthereumIcon, Loading } from "@cartridge/ui";
import { Button, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SequencerProvider, constants, uint256 } from "starknet";
import { CONTRACT_ETH } from "@cartridge/controller/src/constants";
import { BigNumber, utils } from "ethers";

export function EthBalance({
  chainId,
  address,
}: {
  chainId: constants.StarknetChainId;
  address: string;
}) {
  const ethBalance = useEthBalance({ address, chainId });

  return (
    <Button size="xs" leftIcon={<EthereumIcon boxSize={4} />}>
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
  const [ethBalance, setEthBalance] = useState<string>();

  useEffect(() => {
    if (address) {
      const provider = new SequencerProvider({
        network:
          chainId === constants.StarknetChainId.MAINNET
            ? "mainnet-alpha"
            : "goerli-alpha",
      });

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
