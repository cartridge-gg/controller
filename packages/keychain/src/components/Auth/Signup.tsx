import { Field } from "@cartridge/ui";
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
  PORTAL_FOOTER_MIN_HEIGHT,
  PortalBanner,
  PortalFooter,
} from "components";
import { useCallback, useEffect, useState } from "react";
import { DeployAccountDocument, useAccountQuery } from "generated/graphql";
import Controller from "utils/controller";
import { Status } from "utils/account";
import { client } from "utils/graphql";
import { PopupCenter } from "utils/url";
import { FormValues, SignupProps } from "./types";
import { isIframe, validateUsernameFor } from "./utils";
import { useClearField } from "./hooks";
import { RegistrationLink } from "./RegistrationLink";
import { doSignup } from "hooks/account";
import { useControllerTheme } from "hooks/theme";
import { Error as ErrorComp } from "components/Error";

export function Signup({
  prefilledName = "",
  context,
  isSlot,
  onSuccess,
  onLogin,
}: SignupProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(new Error("errorrrrrrrrrrr"));

  const onSubmit = useCallback(async (values: FormValues) => {
    setIsLoading(true);
    setIsRegistering(true);

    // due to same origin restriction, if we're in iframe, pop up a
    // window to continue webauthn registration. otherwise,
    // display modal overlay. in either case, account is created in
    // authenticate component, so we poll and then deploy
    if (isIframe()) {
      PopupCenter(
        `/authenticate?name=${encodeURIComponent(
          values.username,
        )}&action=signup`,
        "Cartridge Signup",
        480,
        640,
      );

      return;
    }

    doSignup(decodeURIComponent(values.username))
      .catch((e) => {
        setError(e);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Container overflowY={error ? "auto" : undefined}>
        <Formik
          initialValues={{ username: prefilledName }}
          onSubmit={onSubmit}
          validateOnChange={false}
          validateOnBlur={false}
        >
          <Form
            onLogin={onLogin}
            onSuccess={onSuccess}
            isRegistering={isRegistering}
            isLoading={isLoading}
            setIsRegistering={setIsRegistering}
            context={context}
            isSlot={isSlot}
            error={error}
          />
        </Formik>
      </Container>
    </>
  );
}

function Form({
  context,
  isRegistering,
  isLoading,
  isSlot,
  onLogin: onLoginProp,
  onSuccess,
  setIsRegistering,
  error,
}: SignupProps & {
  isRegistering: boolean;
  isLoading: boolean;
  setIsRegistering: (val: boolean) => void;
  error: Error;
}) {
  const theme = useControllerTheme();
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
        const {
          account: {
            credentials: {
              webauthn: [{ id: credentialId, publicKey }],
            },
            contractAddress: address,
          },
        } = data;

        const controller = new Controller({
          address,
          username: values.username,
          publicKey,
          credentialId,
        });

        controller.account(constants.StarknetChainId.SN_SEPOLIA).status =
          Status.DEPLOYING;
        await client.request(DeployAccountDocument, {
          id: values.username,
          chainId: "starknet:SN_SEPOLIA",
        });
        await controller.account(constants.StarknetChainId.SN_SEPOLIA).sync();
        controller.store();

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

        onSuccess(controller);
      },
    },
  );

  const onClearUsername = useClearField("username");

  const onLogin = useCallback(() => {
    onLoginProp(values.username);
  }, [values.username, onLoginProp]);

  return (
    <FormikForm style={{ width: "100%" }}>
      <PortalBanner
        title={
          theme.id === "cartridge"
            ? "Play with Cartridge Controller"
            : `Play ${theme.name}`
        }
        description="Create your Cartridge Controller"
      />

      <VStack align="stretch" pb={error ? PORTAL_FOOTER_MIN_HEIGHT : undefined}>
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
              isLoading={isValidating}
            />
          )}
        </FormikField>

        <ErrorComp error={error} />
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
