import { useMemo, useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import { motion } from "framer-motion";
import useSound from "use-sound";
import {
  Box,
  Flex,
  Spacer,
  Divider,
  SimpleGrid,
  Container,
  StyleProps,
} from "@chakra-ui/react";
import {
  useAccountInfoQuery,
  useStarterPackQuery,
  useDeployMainnetAccountMutation,
} from "generated/graphql";
import { SignupHeader, Header } from "components/Header";
import { Dialog as CartridgeDialog } from "@cartridge/ui/src/components/Dialog";
import {
  OutOfStock,
  StarterPack,
  L1Connect,
  L2Connect,
  Quests,
  Pending,
  Ready,
  Form as UsernameForm,
} from "components/signup";

import { useRouter } from "next/router";
import Controller from "utils/controller";
import JoystickIcon from "@cartridge/ui/src/components/icons/Joystick";
import GamepadIcon from "@cartridge/ui/src/components/icons/Gamepad";
import ControllerImage from "@cartridge/ui/src/components/icons/ControllerBig";
import BannerImage from "components/signup/Banner";
import { StepsBar, Step } from "components/StepsBar";
import { Credentials, onCreateFinalize } from "hooks/account";
import { useQuests } from "hooks/quests";
import { parseAttestationObject } from "utils/webauthn";
import { addAddressPadding, number } from "starknet";
import { remoteSvgIcon } from "utils/svg";

import { register, saveDeploy } from "methods/register";

enum RegistrationState {
  CREATE_USERNAME,
  L1_CONNECT,
  L2_CONNECT,
  PENDING,
  QUESTS,
  READY,
  OOS,
}

const CreateWallet: NextPage = () => {
  const router = useRouter();
  const controller = useMemo(() => Controller.fromStore(), []);
  const [deployTx, setDeployTx] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [credentials, setCredentials] = useState<Credentials>();
  const [regState, setRegState] = useState<RegistrationState>(
    RegistrationState.CREATE_USERNAME,
  );

  const [playSound] = useSound(
    "https://static.cartridge.gg/sounds/startup.mp3",
  );

  const { ids } = router.query as {
    ids: Array<string>;
  };
  const gameId = ids && ids[0];
  const {
    error,
    data: starterPackData,
    isLoading: loadingStarterpack,
  } = useStarterPackQuery({ id: gameId }, { enabled: !!ids });

  const { data: accountData } = useAccountInfoQuery(
    { address: addAddressPadding(controller?.address) },
    { enabled: !!controller?.address },
  );

  const { mutateAsync: deployMainnetAccount, isLoading: loadingDeploy } =
    useDeployMainnetAccountMutation();

  const onConfirm = useCallback(
    async (username: string, credentials: Credentials) => {
      // https://webkit.org/blog/11545/updates-to-the-storage-access-api/
      document.cookie = "visited=true; path=/;";

      setUsername(username);
      setCredentials(credentials);

      const {
        pub: { x, y },
      } = parseAttestationObject(credentials.response.attestationObject);

      const { address, deviceKey } = await register()(
        username,
        credentials.id,
        {
          x: x.toString(),
          y: y.toString(),
        },
      );

      const result = await onCreateFinalize(deviceKey, credentials);

      const hash =
        result.finalizeRegistration.contracts.edges[0].node.deployTransaction
          .transactionHash;
      await saveDeploy(process.env.NEXT_PUBLIC_ADMIN_URL)(hash);

      // const deployResult = await deployMainnetAccount({
      //   id: username,
      //   starterpackId: data?.game?.starterPack?.id,
      // });

      // setDeployTx(deployResult.deployAccount.deployTransaction.transactionHash);
      setRegState(RegistrationState.READY);
    },
    [],
  );

  useEffect(() => {
    if (starterPackData) {
      const remaining =
        starterPackData?.game?.starterPack?.maxIssuance -
        starterPackData?.game?.starterPack?.issuance;
      if (remaining < 0) {
        setRegState(RegistrationState.OOS);
      }
    }
  }, [starterPackData]);

  useEffect(() => {
    const account = accountData?.accounts?.edges?.[0]?.node;
    if (!account) return;

    setUsername(account.id);
  }, [accountData]);

  let steps: Step[] = [];
  steps.push({ name: "Create Controller", icon: <JoystickIcon /> });
  if (starterPackData?.game) {
    steps.push({
      name: `Play ${starterPackData.game.name}`,
      icon: remoteSvgIcon(
        starterPackData.game.icon.uri,
        "16px",
        "currentColor",
      ),
    });
  } else {
    steps.push({ name: "Play", icon: <GamepadIcon /> });
  }

  if (!router.isReady || loadingStarterpack) {
    return <></>;
  }

  return (
    <>
      {starterPackData ? (
        <SignupHeader>
          <StepsBar
            maxWidth={["full", steps.length * 220, steps.length * 220]}
            steps={steps}
            active={regState === RegistrationState.CREATE_USERNAME ? 0 : 1}
          />
        </SignupHeader>
      ) : (
        <Header />
      )}

      <BannerImage
        imgSrc={starterPackData?.game.banner.uri}
        obscuredWidth="0px"
        position="absolute"
      />
      <Flex top="-100px" w="full" position="fixed" justify="center" zIndex="-1">
        <ControllerImage opacity="0.45" fill="whiteAlpha.50" />
      </Flex>
      <Container
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        w={starterPackData ? ["full", "full", "800px"] : ["full", "400px"]}
        h="calc(100vh - 74px)"
        pt="100px"
        centerContent
      >
        <Dialog regState={regState} username={username} />
        <SimpleGrid
          w="full"
          columns={[1, 1, starterPackData ? 2 : 1]}
          spacing="25px"
        >
          {starterPackData?.game?.starterPack && (
            <Flex order={[2, 2, 1]} direction="column" gap="12px">
              <StarterPack
                starterpack={starterPackData.game.starterPack}
                gameIcon={remoteSvgIcon(
                  starterPackData.game.icon.uri,
                  "24px",
                  "currentColor",
                )}
              />
            </Flex>
          )}
          {regState == RegistrationState.L1_CONNECT && (
            <L1Connect username={username} credentials={credentials} />
          )}
          {regState == RegistrationState.L2_CONNECT && (
            <L2Connect
              username={username}
              credentials={credentials}
              allowArgent={false}
              onComplete={() => {
                if (
                  starterPackData?.game?.starterPack?.prerequisitesQuests
                    ?.length > 0
                ) {
                  setRegState(RegistrationState.QUESTS);
                  const path = new URL(window.location.href);
                  path.searchParams.set("state", regState.toString());

                  router.replace(path.toString());
                } else if (starterPackData?.game) {
                  router.replace(`/games/${starterPackData.game.id}`);
                } else {
                  router.replace("/");
                }
              }}
            />
          )}
          {regState == RegistrationState.CREATE_USERNAME && (
            <UsernameForm onConfirm={onConfirm} />
          )}
          {regState == RegistrationState.QUESTS &&
            starterPackData?.game?.starterPack?.prerequisitesQuests?.length >
              0 && (
              <Quests
                username={username}
                gameId={gameId}
                starterpackId={starterPackData?.game?.starterPack?.id}
                playSound={playSound}
              />
            )}
          {regState == RegistrationState.PENDING && (
            <Pending
              transaction={deployTx}
              name={starterPackData?.game?.name}
              gameId={starterPackData?.game?.id}
            />
          )}
          {regState == RegistrationState.OOS && <OutOfStock />}

          {starterPackData && (
            <Divider
              order={1}
              display={["block", "block", "none"]}
              borderColor="gray.600"
            />
          )}
        </SimpleGrid>
      </Container>
      {regState == RegistrationState.READY && (
        <Ready
          playSound={playSound}
          onComplete={() => {
            const { redirect_uri } = router.query;
            if (redirect_uri) {
              router.replace(decodeURIComponent(redirect_uri as string));
            } else {
              router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
            }
          }}
        />
      )}
    </>
  );
};

const Dialog = ({
  regState,
  username,
}: {
  regState: RegistrationState;
  username: string;
}) => {
  let title: string, description: string;
  switch (regState) {
    case RegistrationState.CREATE_USERNAME:
      title = "SELECT USERNAME";
      description = "What should we call you?";
      break;
    case RegistrationState.OOS:
      title = "SOLD OUT";
      break;
    default:
      title = `HELLO, ${username?.toUpperCase() || "PLAYER"}`;
      description = "Complete these steps to continue";
      break;
  }
  return (
    <CartridgeDialog
      title={title}
      description={description}
      width={["full", "340px"]}
      mb={["30px", "50px"]}
    />
  );
};

export default CreateWallet;
