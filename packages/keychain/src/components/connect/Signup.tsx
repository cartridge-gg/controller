import { Field } from "@cartridge/ui";
import { Button } from "@chakra-ui/react";
import { Container, Footer, Content } from "components/layout";
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
import { constants, shortString } from "starknet";
import { useConnection } from "hooks/connection";
import { useDebounce } from "hooks/debounce";
import { ErrorAlert } from "components/ErrorAlert";

export function Signup({
  prefilledName = "",
  isSlot,
  onSuccess,
  onLogin,
}: SignupProps) {
  const theme = useControllerTheme();

  return (
    <Container
      variant="connect"
      title={
        theme.id === "cartridge"
          ? "Play with Cartridge Controller"
          : `Play ${theme.name}`
      }
      description="Create your Cartridge Controller"
    >
      <Formik
        initialValues={{ username: prefilledName }}
        onSubmit={() => {
          /* defer to onClick */
        }}
      >
        <Form onLogin={onLogin} onSuccess={onSuccess} isSlot={isSlot} />
      </Formik>
    </Container>
  );
}

function Form({ isSlot, onLogin, onSuccess }: SignupProps) {
  const { chainId, rpcUrl, setController } = useConnection();
  const { values, errors, setErrors, setTouched } =
    useFormikContext<FormValues>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { debouncedValue: username, debouncing } = useDebounce(
    values.username,
    1000,
  );

  useEffect(() => {
    setErrors(undefined);

    if (username) {
      const validate = async () => {
        setIsValidating(true);
        const error = await validateUsernameFor("signup")(username);
        if (error) {
          setTouched({ username: true }, false);
          setErrors({ username: error });
        }

        setIsValidating(false);
      };
      validate();
    }
  }, [username, setErrors, setTouched]);

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
        // mainnet deployment requires user to self fund account
        // if (chainId !== constants.StarknetChainId.SN_MAIN) {
        //   await client.request(DeployAccountDocument, {
        //     id: values.username,
        //     chainId: `starknet:${shortString.decodeShortString(chainId)}`,
        //   });
        // }

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
  const [error, setError] = useState<Error>();

  const onSubmit = useCallback(() => {
    setError(undefined);
    setIsRegistering(true);

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("name", encodeURIComponent(username));
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

    doSignup(decodeURIComponent(username))
      .catch((e) => {
        setErrors({ username: e.message });
      })
      .finally(() => setIsRegistering(false));
  }, [username, setErrors]);

  return (
    <FormikForm style={{ width: "100%" }}>
      <Content>
        <FormikField name="username" placeholder="Username">
          {({ field, meta, form }) => (
            <Field
              {...field}
              autoFocus
              placeholder="Username"
              touched={meta.touched}
              error={meta.error || errors?.username}
              onChange={(e) => {
                setError(undefined);
                field.onChange(e);
              }}
              onClear={() => {
                setError(undefined);
                form.setFieldValue(field.name, "");
                setErrors(undefined);
              }}
            />
          )}
        </FormikField>
      </Content>

      <Footer isSlot={isSlot} isSignup>
        {error && (
          <ErrorAlert title="Login failed" description={error.message} />
        )}

        <Button
          colorScheme="colorful"
          isLoading={isRegistering}
          isDisabled={
            debouncing || !username || !!errors?.username || isValidating
          }
          onClick={onSubmit}
        >
          sign up
        </Button>
        <RegistrationLink
          description="Already have a Controller?"
          onClick={() => onLogin(values.username)}
        >
          Log In
        </RegistrationLink>
      </Footer>
    </FormikForm>
  );
}
