import { Button, Circle } from "@chakra-ui/react";
import { useChainName } from "hooks/chain";
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
    <Button
      size="xs"
      leftIcon={<Circle bg="#73C4FF" size={2} />}
      fontFamily="Inter"
    >
      {chainName}
    </Button>
  );
}
