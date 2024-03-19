import { Button } from "@chakra-ui/react";
import { useEffect } from "react";
import { useAccount, useConfig, useConnect, useDisconnect } from "wagmi";

export function ConnectButton({
  onConnect,
  onDisconnect,
}: {
  onConnect: (ethAddress: string) => void;
  onDisconnect: () => void;
}) {
  const { address: ethAddress, isConnected } = useAccount();
  const { connectors } = useConfig();
  const { connect } = useConnect({ connector: connectors[0] });
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isConnected && !!ethAddress) {
      onConnect(ethAddress);
    } else {
      onDisconnect();
    }
  }, [isConnected, ethAddress, onConnect, onDisconnect]);

  return (
    <>
      <Button
        flexBasis="50%"
        variant="special"
        bg="solid.primary"
        color={isConnected ? "text.secondary" : undefined}
        onClick={() => {
          if (isConnected) {
            disconnect();
          } else {
            connect();
          }
        }}
      >
        {isConnected ? "Disconnect" : "Connect"}
      </Button>
    </>
  );
}
