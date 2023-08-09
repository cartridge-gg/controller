// import { useWhitelist } from "hooks/whitelist";
import { useDisclosure } from "@chakra-ui/react";
import { useAccountQuery, useStarterPackQuery } from "generated/graphql";
import { useDebounce } from "hooks/debounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KeyPair } from "starknet";
import { PopupCenter } from "utils/url";

type UseAuthParams = {
  prefilledName?: string;
  // starterPackId?: string;
};

export function useAuth({
  prefilledName,
}: // starterPackId,
UseAuthParams) {
  const [name, setName] = useState(prefilledName);
  // const [keypair, setKeypair] = useState<KeyPair>();
  // const [nameError, setNameError] = useState("");
  // const [selectedName, setSelectedName] = useState<string>();
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [canContinue, setCanContinue] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);

  const isIframe =
    typeof window !== "undefined" ? window.top !== window.self : false;
  // const { web3AuthEnabled } = useWhitelist();

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const {
    isOpen: isAuthOpen,
    onOpen: onAuthOpen,
    onClose: onAuthClose,
  } = useDisclosure();

  const { debouncedValue: debouncedName, debouncing } = useDebounce(name, 1500);
  const {
    error,
    isFetching,
    data: accountData,
  } = useAccountQuery(
    { id: debouncedName },
    {
      enabled: !!(debouncedName && debouncedName.length >= 3) && !isRegistering,
      retry: false,
    },
  );

  // const {
  //   data: starterData,
  //   error: starterError,
  //   isLoading: starterLoading,
  // } = useStarterPackQuery(
  //   {
  //     id: starterPackId,
  //   },
  //   { enabled: !!starterPackId && !isRegistering },
  // );

  // const remaining = starterData
  //   ? starterData.game.starterPack.maxIssuance -
  //     starterData.game.starterPack.issuance
  //   : 0;

  // useAccountQuery(
  //   { id: selectedName },
  //   {
  //     enabled: isRegistering,
  //     refetchIntervalInBackground: true,
  //     refetchOnWindowFocus: false,
  //     staleTime: 10000000,
  //     cacheTime: 10000000,
  //     refetchInterval: (data) => (!data ? 1000 : undefined),
  //     onSuccess: (data) => deploy(data),
  //   },
  // );

  // const deploy = useCallback(
  //   (data) => {
  //     console.log("deploy request");
  //     const {
  //       account: {
  //         credential: { id: credentialId },
  //         contractAddress: address,
  //       },
  //     } = data;

  //     const controller = new Controller(keypair, address, credentialId);

  //     if (onController) onController(controller);

  //     controller.account(constants.StarknetChainId.TESTNET).status =
  //       Status.DEPLOYING;
  //     client
  //       .request(DeployAccountDocument, {
  //         id: debouncedName,
  //         chainId: "starknet:SN_GOERLI",
  //         starterpackIds: starterData?.game?.starterPack?.chainID?.includes(
  //           "SN_GOERLI",
  //         )
  //           ? [starterData?.game?.starterPack?.id]
  //           : undefined,
  //       })
  //       .then(() => {
  //         controller.account(constants.StarknetChainId.TESTNET).sync();
  //       });

  //     controller.account(constants.StarknetChainId.MAINNET).status =
  //       Status.DEPLOYING;
  //     client
  //       .request(DeployAccountDocument, {
  //         id: debouncedName,
  //         chainId: "starknet:SN_MAIN",
  //         starterpackIds: starterData?.game?.starterPack?.chainID?.includes(
  //           "SN_MAIN",
  //         )
  //           ? [starterData?.game?.starterPack?.id]
  //           : undefined,
  //       })
  //       .then(() => {
  //         controller.account(constants.StarknetChainId.MAINNET).sync();
  //       });
  //   },
  //   [keypair, onController],
  // );

  // handle username input events
  useEffect(() => {
    if (debouncing) {
      return;
    }

    if (error) {
      if ((error as Error).message === "ent: account not found") {
        // setNameError("");
        // setCanContinue(true);
        if (!dismissed) {
          onDrawerOpen();
        }
      } else {
        setNameError("An error occured.");
        setCanContinue(false);
      }
    } else if (accountData?.account) {
      setNameError("This account already exists.");
      setCanContinue(false);
    }
  }, [error, accountData, debouncing, dismissed, onDrawerOpen]);

  // const onContinue = useCallback(async () => {
  //   const keypair = ec.genKeyPair();
  //   const deviceKey = ec.getStarkKey(keypair);

  //   setIsRegistering(true);
  //   setKeypair(keypair);
  //   setSelectedName(debouncedName);

  //   // due to same origin restriction, if we're in iframe, pop up a
  //   // window to continue webauthn registration. otherwise,
  //   // display modal overlay. in either case, account is created in
  //   // authenticate component, so we poll and then deploy
  //   if (isIframe) {
  //     PopupCenter(
  //       `/authenticate?name=${encodeURIComponent(
  //         debouncedName,
  //       )}&pubkey=${encodeURIComponent(deviceKey)}`,
  //       "Cartridge Signup",
  //       480,
  //       640,
  //     );
  //   } else {
  //     onAuthOpen();
  //   }
  // }, [debouncedName, starterData, isIframe, onAuthOpen, onController]);

  const validateName = useCallback((values: { name: string }) => {
    // setCanContinue(false);
    // setNameError(undefined);
    if (!values.name) {
      // setNameError("Username required");
      return "Username required";
    } else if (values.name.length < 3) {
      // setNameError("Username must be at least 3 characters");
      return "Username must be at least 3 characters";
    } else if (values.name.split(" ").length > 1) {
      // setNameError("Username cannot contain spaces");
      return "Username cannot contain spaces";
    }
    // else {
    //  setName(values.name);
    // }

    return null;
  }, []);

  const onSubmit = useCallback(() => {
    if (!canContinue) return;

    onDrawerOpen();
  }, [canContinue, onDrawerOpen]);

  return useMemo(
    () => ({ name, validateName, onSubmit }),
    [name, validateName, onSubmit],
  );
}
