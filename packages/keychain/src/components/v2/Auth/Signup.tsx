import { Field, PlugNewDuoIcon } from "@cartridge/ui";
import { VStack, Button } from "@chakra-ui/react";
import { Container } from "../Container";
import { Form as FormikForm, Field as FormikField, Formik } from "formik";
import { constants, ec, KeyPair } from "starknet";
import { PortalFooter, PORTAL_FOOTER_MIN_HEIGHT } from "./PortalFooter";
import { PortalBanner } from "components/PortalBanner";
import { useCallback, useMemo, useState } from "react";
import {
  DeployAccountDocument,
  useAccountQuery,
  useStarterPackQuery,
} from "generated/graphql";
import Controller from "utils/controller";
import { Status } from "utils/account";
import { client } from "utils/graphql";
import { PopupCenter } from "utils/url";
import { FormValues, SignupProps } from "./types";
import { validateUsername } from "./validate";
import { useClearField, useSubmitType, useUsername } from "./hooks";
import BannerImage from "components/signup/BannerImage";

export function Signup({
  fullPage = false,
  prefilledName = "",
  origin,
  onController,
  onComplete,
  starterPackId,
  onLogin,
}: SignupProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const isIframe = useMemo(
    () => (typeof window !== "undefined" ? window.top !== window.self : false),
    [],
  );
  const { keypair, deviceKey } = useMemo(() => {
    const keypair = ec.genKeyPair();
    return {
      keypair,
      deviceKey: ec.getStarkKey(keypair),
    };
  }, []);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setIsRegistering(true);

      // due to same origin restriction, if we're in iframe, pop up a
      // window to continue webauthn registration. otherwise,
      // display modal overlay. in either case, account is created in
      // authenticate component, so we poll and then deploy
      if (isIframe) {
        PopupCenter(
          `/authenticate?name=${encodeURIComponent(
            values.username,
          )}&pubkey=${encodeURIComponent(deviceKey)}`,
          "Cartridge Signup",
          480,
          640,
        );
      } else {
        // onAuthOpen();
      }
    },
    [isIframe, deviceKey],
  );

  return (
    <Container fullPage={fullPage}>
      <Formik initialValues={{ username: prefilledName }} onSubmit={onSubmit}>
        <Form
          onLogin={onLogin}
          starterPackId={starterPackId}
          onController={onController}
          keypair={keypair}
          isRegistering={isRegistering}
          origin={origin}
        />
      </Formik>
    </Container>
  );
}

function Form({
  starterPackId,
  origin,
  onController,
  onLogin,
  keypair,
  isRegistering,
}: Pick<
  SignupProps,
  "starterPackId" | "origin" | "onController" | "onLogin"
> & {
  keypair: KeyPair;
  isRegistering: boolean;
}) {
  const { data: starterData } = useStarterPackQuery(
    {
      id: starterPackId,
    },
    { enabled: !!starterPackId && !isRegistering },
  );

  const { username } = useUsername();
  const submitType = useSubmitType(username, { isRegistering });

  // for polling approach when iframe
  useAccountQuery(
    { id: username },
    {
      enabled: isRegistering,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      staleTime: 10000000,
      cacheTime: 10000000,
      refetchInterval: (data) => (!data ? 1000 : undefined),
      onSuccess: (data) => {
        console.log("deploy request");
        const {
          account: {
            credential: { id: credentialId },
            contractAddress: address,
          },
        } = data;

        const controller = new Controller(keypair, address, credentialId);

        if (onController) onController(controller);

        controller.account(constants.StarknetChainId.TESTNET).status =
          Status.DEPLOYING;
        client
          .request(DeployAccountDocument, {
            id: username,
            chainId: "starknet:SN_GOERLI",
            starterpackIds: starterData?.game?.starterPack?.chainID?.includes(
              "SN_GOERLI",
            )
              ? [starterData?.game?.starterPack?.id]
              : undefined,
          })
          .then(() => {
            controller.account(constants.StarknetChainId.TESTNET).sync();
          });

        controller.account(constants.StarknetChainId.MAINNET).status =
          Status.DEPLOYING;
        client
          .request(DeployAccountDocument, {
            id: username,
            chainId: "starknet:SN_MAIN",
            starterpackIds: starterData?.game?.starterPack?.chainID?.includes(
              "SN_MAIN",
            )
              ? [starterData?.game?.starterPack?.id]
              : undefined,
          })
          .then(() => {
            controller.account(constants.StarknetChainId.MAINNET).sync();
          });
      },
    },
  );
  const onClearUsername = useClearField("username");
  const remaining = useMemo(
    () =>
      starterData
        ? starterData.game.starterPack.maxIssuance -
          starterData.game.starterPack.issuance
        : 0,
    [starterData],
  );

  return (
    <FormikForm style={{ width: "100%" }}>
      <PortalBanner
        icon={<PlugNewDuoIcon boxSize={8} />}
        title="Sign Up"
        description="Select a username"
      />

      {starterData && remaining > 0 && (
        <BannerImage
          imgSrc={starterData?.game.banner.uri}
          obscuredWidth="0px"
        />
      )}

      <VStack align="stretch" paddingBottom={PORTAL_FOOTER_MIN_HEIGHT}>
        <FormikField
          name="username"
          placeholder="Username"
          validate={validateUsername}
        >
          {({ field, meta }) => (
            <Field
              {...field}
              placeholder="Username"
              touched={meta.touched}
              error={meta.error}
              onClear={onClearUsername}
            />
          )}
        </FormikField>
      </VStack>

      <PortalFooter origin={origin}>
        <VStack
          w="full"
          alignItems="flex"
          p={4}
          bg="solid.bg"
          position="fixed"
          bottom={0}
        >
          <Button
            type="submit"
            colorScheme="colorful"
            isDisabled={submitType !== "signup"}
          >
            Sign Up
          </Button>

          <Button
            isDisabled={submitType !== "login"}
            onClick={() => onLogin(username)}
          >
            Log In
          </Button>
        </VStack>
      </PortalFooter>
    </FormikForm>
  );
}
