import { useEffect, useState } from "react";
import { Button, Divider, HStack, Text } from "@chakra-ui/react";
import { Web3AuthCore } from "@web3auth/core";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import Discord from "./icons/Discord";
import MetaMask from "./icons/Metamask";
import { ec, number, KeyPair } from "starknet";

const clientId =
  "BKpRo2vJuxbHH3giMVQfdts2l1P3D51AB5hIZ_-HNfkfisVV94Q4aQcZbjXjduwZW8j6n1TlBaEl6Q1nOQXRCG0";

const Web3Auth = ({ onAuth }: { onAuth: (keyPair: KeyPair) => void }) => {
  const [web3auth, setWeb3auth] = useState<Web3AuthCore | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3AuthCore({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.OTHER,
          },
          web3AuthNetwork: "cyan",
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            loginConfig: {
              discord: {
                verifier: "cartridge-discord",
                typeOfLogin: "discord",
                clientId: "993873951828754434",
              },
            },
          },
        });
        web3auth.configureAdapter(openloginAdapter);
        setWeb3auth(web3auth);

        await web3auth.init();
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

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
    onAuth(keyPair);
    // const address = computeAddress();
    // new Controller(keyPair, "", loginProvider);
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
          <Discord height="16px" width="16px" mr="8px" />Connect with Discord
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
