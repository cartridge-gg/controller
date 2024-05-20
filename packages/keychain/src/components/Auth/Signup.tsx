import { Field, PlugNewDuoIcon } from "@cartridge/ui";
import { VStack, Button } from "@chakra-ui/react";
import { Container } from "../Container";
import {
  Form as FormikForm,
  Field as FormikField,
  Formik,
  useFormikContext,
} from "formik";
import { constants } from "starknet";
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
import { RegistrationLink } from "./RegistrationLink";
import { Credentials, onCreateBegin, onCreateFinalize } from "hooks/account";
import { useStartup } from "hooks/startup";

export function Signup({
  prefilledName = "",
  context,
  onController,
  onComplete: onCompleteProp,
  starterPackId,
  onLogin,
  isSlot,
}: SignupProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const onComplete = useCallback(() => {
    if (starterPackId) {
      setClaimSuccess(true);
      return;
    }

    onCompleteProp?.();
  }, [starterPackId, onCompleteProp]);

  const { play, StartupAnimation } = useStartup({ onComplete });

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setIsLoading(true);
      setIsRegistering(true);

      // due to same origin restriction, if we're in iframe, pop up a
      // window to continue webauthn registration. otherwise,
      // display modal overlay. in either case, account is created in
      // authenticate component, so we poll and then deploy
      if (isIframe) {
        PopupCenter(
          `/authenticate?name=${encodeURIComponent(values.username)}`,
          "Cartridge Signup",
          480,
          640,
        );
      } else {
        // https://webkit.org/blog/11545/updates-to-the-storage-access-api/
        document.cookie = "visited=true; path=/;";

        try {
          const credentials: Credentials = await onCreateBegin(
            decodeURIComponent(values.username),
          );
          await onCreateFinalize(credentials);

          play();
        } catch (e) {
          console.error(e);
          setIsLoading(false);
          throw e;
        }

        setIsLoading(false);
      }
    },
    [isIframe, play],
  );

  if (claimSuccess) {
    return (
      <ClaimSuccess
        name={starterData?.game.name}
        banner={starterData?.game.banner.uri}
        url={starterData?.game.socials.website}
      />
    );
  }

  return (
    <>
      <Container>
        <Formik
          initialValues={{ username: prefilledName }}
          onSubmit={onSubmit}
          validateOnChange={false}
          validateOnBlur={false}
        >
          <Form
            onLogin={onLogin}
            onController={onController}
            isRegistering={isRegistering}
            isLoading={isLoading}
            setIsRegistering={setIsRegistering}
            context={context}
            starterData={starterData}
            isSlot={isSlot}
          />
        </Formik>
      </Container>

      {StartupAnimation}
    </>
  );
}

function Form({
  context,
  onController,
  onLogin: onLoginProp,
  isRegistering,
  isLoading,
  setIsRegistering,
  starterData,
  isSlot,
}: Pick<SignupProps, "context" | "isSlot" | "onController" | "onLogin"> & {
  isRegistering: boolean;
  isLoading: boolean;
  setIsRegistering: (val: boolean) => void;
  starterData: StarterPackQuery;
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
              webauthn: [{ id: credentialId, publicKey }],
            },
            contractAddress: address,
          },
        } = data;

        const controller = new Controller(address, publicKey, credentialId);

        controller.account(constants.StarknetChainId.SN_SEPOLIA).status =
          Status.DEPLOYING;
        await client.request(DeployAccountDocument, {
          id: values.username,
          chainId: "starknet:SN_SEPOLIA",
        });
        await controller.account(constants.StarknetChainId.SN_SEPOLIA).sync();

        // TODO: Enable once controller is ready for mainnet
        // controller.account(constants.StarknetChainId.SN_MAIN).status =
        //   Status.DEPLOYING;
        // client
        //   .request(DeployAccountDocument, {
        //     id: values.username,
        //     chainId: "starknet:SN_MAIN",
        //     starterpackIds: starterData?.game?.starterPack?.chainID?.includes(
        //       "SN_MAIN",
        //     )
        //       ? [starterData?.game?.starterPack?.id]
        //       : undefined,
        //   })
        //   .then(() => {
        //     controller.account(constants.StarknetChainId.SN_MAIN).sync();
        //   });

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
        title="Play Roll Your Own"
        description="Create your Cartridge Controller"
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
      </VStack>

      <PortalFooter
        origin={context?.origin}
        policies={context?.policies}
        isSignup
        isSlot={isSlot}
      >
        <Button type="submit" colorScheme="colorful" isLoading={isLoading}>
          sign up
        </Button>
        <RegistrationLink
          description="Already have a Controller?"
          onClick={onLogin}
        >
          Log In
        </RegistrationLink>
      </PortalFooter>
    </FormikForm>
  );
}
