import { Field } from "@cartridge/ui";
import { Button } from "@chakra-ui/react";
import {
  Container,
  FOOTER_MIN_HEIGHT,
  Footer,
  Content,
} from "components/layout";
import {
  Form as FormikForm,
  Field as FormikField,
  Formik,
  useFormikContext,
} from "formik";
import { useCallback, useEffect, useState } from "react";
import { DeployAccountDocument, useAccountQuery } from "generated/graphql";
import Controller from "utils/controller";
import { client } from "utils/graphql";
import { PopupCenter } from "utils/url";
import { FormValues, SignupProps } from "./types";
import { isIframe, validateUsernameFor } from "./utils";
import { RegistrationLink } from "./RegistrationLink";
import { doSignup } from "hooks/account";
import { useControllerTheme } from "hooks/theme";
import { Error as ErrorComp } from "components/Error";
import { shortString } from "starknet";
import { useConnection } from "hooks/connection";

export function Signup({
  prefilledName = "",
  isSlot,
  onSuccess,
  onLogin,
}: SignupProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const theme = useControllerTheme();

  const onSubmit = useCallback(async (values: FormValues) => {
    setIsLoading(true);
    setIsRegistering(true);

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("name", encodeURIComponent(values.username));
    searchParams.set("action", "signup");

    // due to same origin restriction, if we're in iframe, pop up a
    // window to continue webauthn registration. otherwise,
    // display modal overlay. in either case, account is created in
    // authenticate component, so we poll and then deploy
    if (isIframe()) {
      PopupCenter(
        `/authenticate?${searchParams.toString()}`,
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
      <Container
        variant="connect"
        overflowY={error ? "auto" : undefined}
        title={
          theme.id === "cartridge"
            ? "Play with Cartridge Controller"
            : `Play ${theme.name}`
        }
        description="Create your Cartridge Controller"
      >
        <Formik
          initialValues={{ username: prefilledName }}
          onSubmit={onSubmit}
          validateOnChange={false}
          validateOnBlur={false}
        >
          <Form
            onLogin={onLogin}
            isRegistering={isRegistering}
            isLoading={isLoading}
            onSuccess={onSuccess}
            setIsRegistering={setIsRegistering}
            isSlot={isSlot}
            error={error}
          />
        </Formik>
      </Container>
    </>
  );
}

function Form({
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
  const { chainId, rpcUrl, setController } = useConnection();
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
        // Deploy account
        await client.request(DeployAccountDocument, {
          id: values.username,
          chainId: `starknet:${shortString.decodeShortString(chainId)}`,
        });

        const {
          account: {
            credentials: {
              webauthn: [{ id: credentialId, publicKey }],
            },
            contractAddress: address,
          },
        } = data;

        const controller = new Controller({
          chainId,
          rpcUrl,
          address,
          username: values.username,
          publicKey,
          credentialId,
        });

        controller.store();
        setController(controller);

        if (onSuccess) {
          onSuccess();
        }
      },
    },
  );

  const onLogin = useCallback(() => {
    onLoginProp(values.username);
  }, [values.username, onLoginProp]);

  return (
    <FormikForm style={{ width: "100%" }}>
      <Content pb={error ? FOOTER_MIN_HEIGHT : undefined}>
        <FormikField
          name="username"
          placeholder="Username"
          validate={validateUsernameFor("signup")}
        >
          {({ field, meta, form }) => (
            <Field
              {...field}
              autoFocus
              placeholder="Username"
              touched={meta.touched}
              error={meta.error}
              onClear={() => form.setFieldValue(field.name, "")}
              isLoading={isValidating}
            />
          )}
        </FormikField>

        <ErrorComp error={error} />
      </Content>

      <Footer isSlot={isSlot} createSession showTerm>
        <Button type="submit" colorScheme="colorful" isLoading={isLoading}>
          sign up
        </Button>
        <RegistrationLink
          description="Already have a Controller?"
          onClick={onLogin}
        >
          Log In
        </RegistrationLink>
      </Footer>
    </FormikForm>
  );
}
