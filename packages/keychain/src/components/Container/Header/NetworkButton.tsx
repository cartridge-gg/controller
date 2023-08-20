import { Button, Circle } from "@chakra-ui/react";
import { useMemo } from "react";
import { constants } from "starknet";

export function NetworkButton({
  chainId,
}: {
  chainId: constants.StarknetChainId;
}) {
  const chainName = useChainName(chainId);

  // TODO: get connection status
  // const statusColor = useMemo(() => {
  //   switch (status) {
  //     case "connected":
  //       return "#73C4FF";
  //     default:
  //       return "red";
  //   }
  // }, [status]);

  return (
    <Button size="xs" leftIcon={<Circle bg="#73C4FF" size={2} />}>
      {chainName}
    </Button>
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
