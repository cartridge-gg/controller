import { Button } from "@chakra-ui/react";
import { useEffect } from "react";
import { useAccount, useClient, useConnect, useDisconnect } from "wagmi";

const ConnectButton = ({
  onConnect,
  onDisconnect,
}: {
  onConnect: (ethAddress: string) => void;
  onDisconnect: () => void;
}) => {
  const { address: ethAddress, isConnected } = useAccount();
  const { connectors } = useClient();
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
        bgColor="gray.700"
        color={isConnected ? "whiteAlpha.800" : undefined}
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
};

export default ConnectButton;
