import { Field, PlugNewDuoIcon } from "@cartridge/ui";
import { VStack, Button, useDisclosure } from "@chakra-ui/react";
import { Container } from "../Container";
import {
  Form as FormikForm,
  Field as FormikField,
  Formik,
  useFormikContext,
} from "formik";
import { constants, ec, KeyPair } from "starknet";
import {
  PortalBanner,
  PortalFooter,
  PORTAL_FOOTER_MIN_HEIGHT,
} from "components";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DeployAccountDocument,
  StarterPackQuery,
  useAccountQuery,
  useStarterPackQuery,
} from "generated/graphql";
import Controller from "utils/controller";
import { Status } from "utils/account";
import { client } from "utils/graphql";
import { PopupCenter } from "utils/url";
import { FormValues, SignupProps } from "./types";
import { validateUsernameFor } from "./utils";
import { useClearField } from "./hooks";
import { BannerImage } from "./BannerImage";
import { ClaimSuccess } from "./StarterPack";
import { Authenticate as AuthModal } from "./Authenticate";
import { RegistrationLink } from "./RegistrationLink";

export function Signup({
  fullPage = false,
  prefilledName = "",
  context,
  onController,
  onComplete: onCompleteProp,
  starterPackId,
  onLogin,
}: SignupProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);

  const {
    isOpen: isAuthOpen,
    onOpen: onAuthOpen,
    onClose: onAuthClose,
  } = useDisclosure();

  const { data: starterData } = useStarterPackQuery(
    {
      id: starterPackId,
    },
    { enabled: !!starterPackId && !isRegistering },
  );

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

  const onComplete = useCallback(() => {
    if (starterPackId) {
      setClaimSuccess(true);
      return;
    }

    onCompleteProp();
  }, [starterPackId, onCompleteProp]);

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
        onAuthOpen();
      }
    },
    [isIframe, deviceKey, onAuthOpen],
  );

  if (claimSuccess) {
    // hardcode briq for now
    const media =
      starterData?.game.name === "Briq"
        ? "https://storage.googleapis.com/c7e-prod-static/media/briq_cartridge_poap_nft_paris_1_7x16x11.glb"
        : undefined;
    return (
      <ClaimSuccess
        name={starterData?.game.name}
        banner={starterData?.game.banner.uri}
        url={starterData?.game.socials.website}
        media={media}
        fullPage={fullPage}
      />
    );
  }

  return (
    <Container fullPage={fullPage}>
      <Formik
        initialValues={{ username: prefilledName }}
        onSubmit={onSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        <Form
          onLogin={onLogin}
          onController={onController}
          keypair={keypair}
          isRegistering={isRegistering}
          setIsRegistering={setIsRegistering}
          fullPage={fullPage}
          context={context}
          starterData={starterData}
          isAuthOpen={isAuthOpen}
          onAuthClose={onAuthClose}
          onComplete={onComplete}
        />
      </Formik>
    </Container>
  );
}

function Form({
  fullPage,
  context,
  onController,
  onLogin: onLoginProp,
  keypair,
  isRegistering,
  setIsRegistering,
  starterData,
  isAuthOpen,
  onAuthClose,
  onComplete,
}: Pick<SignupProps, "fullPage" | "context" | "onController" | "onLogin"> & {
  keypair: KeyPair;
  isRegistering: boolean;
  setIsRegistering: (val: boolean) => void;
  starterData: StarterPackQuery;
  isAuthOpen: boolean;
  onAuthClose: () => void;
  onComplete: () => void;
}) {
  const { values, isValidating } = useFormikContext<FormValues>();

  useEffect(() => {
    setIsRegistering(false);
  }, [values.username, setIsRegistering]);

  // for polling approach when iframe
  useAccountQuery(
    { id: values.username },
    {
      enabled: isRegistering,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      staleTime: 10000000,
      cacheTime: 10000000,
      refetchInterval: (data) => (!data ? 1000 : undefined),
      onSuccess: async (data) => {
        console.log("deploy request");
        const {
          account: {
            credentials: {
              webauthn: [{ id: credentialId }],
            },
            contractAddress: address,
          },
        } = data;

        const controller = new Controller(keypair, address, credentialId);

        controller.account(constants.StarknetChainId.TESTNET).status =
          Status.DEPLOYING;
        client
          .request(DeployAccountDocument, {
            id: values.username,
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
            id: values.username,
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

        if (onController) await onController(controller);
      },
    },
  );

  const onClearUsername = useClearField("username");

  const onLogin = useCallback(() => {
    onLoginProp(values.username);
  }, [values.username, onLoginProp]);

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
        Icon={PlugNewDuoIcon}
        title="Sign Up"
        description="Select a username"
      />

      {starterData && remaining > 0 && (
        <BannerImage imgSrc={starterData?.game.banner.uri} />
      )}

      <VStack align="stretch" pb={PORTAL_FOOTER_MIN_HEIGHT}>
        <FormikField
          name="username"
          placeholder="Username"
          validate={validateUsernameFor("signup")}
        >
          {({ field, meta }) => (
            <Field
              {...field}
              autoFocus
              placeholder="Username"
              touched={meta.touched}
              error={meta.error}
              onClear={onClearUsername}
              container={{ mb: 6 }}
              isLoading={isValidating}
            />
          )}
        </FormikField>

        <RegistrationLink
          description="Already have a controller?"
          onClick={onLogin}
        >
          log in
        </RegistrationLink>
      </VStack>

      <PortalFooter
        fullPage={fullPage}
        origin={context?.origin}
        policies={context?.policies}
        isSignup
      >
        <Button type="submit" colorScheme="colorful">
          sign up
        </Button>
      </PortalFooter>

      <AuthModal
        isModal
        isOpen={isAuthOpen}
        onClose={onAuthClose}
        name={values.username}
        pubkey={keypair ? ec.getStarkKey(keypair) : ""}
        onComplete={onComplete}
      />
    </FormikForm>
  );
}
