import { useEffect, useMemo, useState } from "react";
import { useBalanceQuery } from "generated/graphql";
import { BigNumber, utils } from "ethers";
import { constants, SequencerProvider, uint256 } from "starknet";
import {
  CONTRACT_ETH,
  CONTRACT_POINTS,
} from "@cartridge/controller/src/constants";
import { useAvatar } from "hooks/avatar";

export function useHeader({
  address,
  chainId,
}: {
  address: string;
  chainId: constants.StarknetChainId;
}) {
  const chainName = useChainName(chainId);
  const ethBalance = useEthBalance({ address, chainId });
  const { data } = usePointsData(address);
  const { current: avatar } = useAvatar(
    address || "",
    data?.balance?.balance ?? 10,
  );

  return useMemo(
    () => ({ chainName, ethBalance, avatar }),
    [chainName, ethBalance, avatar],
  );
}

function useChainName(chainId: constants.StarknetChainId) {
  return useMemo(() => {
    switch (chainId) {
      case constants.StarknetChainId.MAINNET:
        return "Mainnet";
      case constants.StarknetChainId.TESTNET:
        return "Testnet";
      case constants.StarknetChainId.TESTNET2:
        return "Testnet 2";
    }
  }, [chainId]);
}

function usePointsData(address: string) {
  const pointsChain = "starknet:SN_GOERLI";
  const pointsTokenAccountId = `${pointsChain}/${pointsChain}:${
    address || ""
  }/erc20:${CONTRACT_POINTS}`;
  return useBalanceQuery({
    tokenAccountId: pointsTokenAccountId,
  });
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
