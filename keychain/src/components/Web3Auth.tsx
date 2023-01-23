import { Button, HStack } from "@chakra-ui/react";
import { WALLET_ADAPTERS } from "@web3auth/base";
import Discord from "./icons/Discord";
import { ec, number } from "starknet";
import { computeAddress } from "methods/register";
import Controller from "utils/controller";
import web3auth from "utils/web3auth";

const Web3Auth = ({
  username,
  onAuth,
}: {
  username: string;
  onAuth: (controller: Controller) => void;
}) => {
  const login = async (loginProvider: "discord" | "twitter" | "metamask") => {
    if (!web3auth) {
      console.error("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      { loginProvider },
    );
    const privateKey: string = await web3authProvider.request({
      method: "private_key",
    });
    const keyPair = ec.getKeyPair(number.toBN(privateKey, "hex"));
    const address = computeAddress(
      username,
      { x0: number.toBN(0), x1: number.toBN(0), x2: number.toBN(0) },
      { y0: number.toBN(0), y1: number.toBN(0), y2: number.toBN(0) },
      ec.getStarkKey(keyPair),
    );
    const controller = new Controller(keyPair, address, loginProvider);
    onAuth(controller);
  };

  return (
    <>
      {/* <HStack>
        <Divider borderColor="whiteAlpha.500" />
        <Text
          mx="18px"
          fontFamily="IBM Plex Sans"
          fontSize="12px"
          color="whiteAlpha.600"
          fontWeight="600"
        >
          or
        </Text>
        <Divider borderColor="whiteAlpha.500" />
      </HStack> */}
      <HStack width="100%">
        <Button
          flex={1}
          variant="secondary700"
          onClick={async () => {
            login("discord");
          }}
        >
          <Discord height="16px" width="16px" mr="12px" mt="1px" />
          Connect with Discord
        </Button>
        {/* <Button flex={1} variant="secondary700" onClick={async () => {
                login("twitter");
            }}><Twitter height="18px" width="18px" /></Button> */}
        {/* <Button
          flex={1}
          variant="secondary700"
          onClick={async () => {
            login("metamask");
          }}
        >
          <MetaMask height="18px" width="18px" />
        </Button> */}
      </HStack>
    </>
  );
};

export default Web3Auth;
