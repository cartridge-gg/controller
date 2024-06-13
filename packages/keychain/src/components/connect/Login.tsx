import { Field } from "@cartridge/ui";
import { Button } from "@chakra-ui/react";
import {
  Container,
  FOOTER_MIN_HEIGHT,
  Footer,
  Content,
} from "components/layout";
import { Form as FormikForm, Field as FormikField, Formik } from "formik";
import { useCallback, useState } from "react";
import Controller from "utils/controller";
import { FormValues, LoginMode, LoginProps } from "./types";
import { useAnalytics } from "hooks/analytics";
import { fetchAccount, validateUsernameFor } from "./utils";
import { RegistrationLink } from "./RegistrationLink";
import { useControllerTheme } from "hooks/theme";
import { doLogin } from "hooks/account";
import { Error as ErrorComp } from "components/Error";
import { useConnection } from "hooks/connection";

export function Login({
  prefilledName = "",
  isSlot,
  mode = LoginMode.Webauthn,
  onSuccess,
  onSignup,
}: LoginProps) {
  const { origin, policies, chainId, rpcUrl, setController } = useConnection();
  const { event: log } = useAnalytics();
  const theme = useControllerTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [expiresAt] = useState<bigint>(3000000000n);
  const [error, setError] = useState();

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setIsLoading(true);

      const {
        account: {
          credentials: {
            webauthn: [{ id: credentialId, publicKey }],
          },
          contractAddress: address,
        },
      } = await fetchAccount(values.username);

      const controller = new Controller({
        chainId,
        rpcUrl,
        address,
        username: values.username,
        publicKey,
        credentialId,
      });

      try {
        switch (mode) {
          case LoginMode.Webauthn:
            await doLogin(values.username, credentialId, publicKey);
            break;
          case LoginMode.Controller:
            if (policies.length === 0) {
              throw new Error("Policies required for controller ");
            }

            await controller.approve(origin, expiresAt, policies);
            break;
        }

        controller.store();
        setController(controller);

        if (onSuccess) {
          onSuccess();
        }

        log({ type: "webauthn_login", address });
      } catch (e) {
        setError(e);

        log({
          type: "webauthn_login_error",
          payload: {
            error: e?.message,
          },
          address,
        });
      }

      setIsLoading(false);
    },
    [
      chainId,
      rpcUrl,
      origin,
      policies,
      expiresAt,
      mode,
      log,
      onSuccess,
      setController,
    ],
  );

  return (
    <Container
      variant="connect"
      overflowY={error ? "auto" : undefined}
      title={
        theme.id === "cartridge"
          ? "Play with Cartridge Controller"
          : `Play ${theme.name}`
      }
      description="Enter your Controller username"
    >
      <Formik
        initialValues={{ username: prefilledName }}
        onSubmit={onSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {(props) => (
          <FormikForm style={{ width: "100%" }}>
            <Content pb={error ? FOOTER_MIN_HEIGHT : undefined}>
              <FormikField
                name="username"
                placeholder="Username"
                validate={validateUsernameFor("login")}
              >
                {({ field, meta, form }) => (
                  <Field
                    {...field}
                    autoFocus
                    placeholder="Username"
                    touched={meta.touched}
                    error={meta.error}
                    isLoading={props.isValidating}
                    isDisabled={isLoading}
                    onClear={() => form.setFieldValue(field.name, "")}
                  />
                )}
              </FormikField>

              <ErrorComp error={error} />
            </Content>

            <Footer isSlot={isSlot} createSession>
              <Button
                type="submit"
                colorScheme="colorful"
                isLoading={isLoading}
              >
                Log in
              </Button>
              <RegistrationLink
                description="Need a controller?"
                onClick={() => onSignup(props.values.username)}
              >
                Sign up
              </RegistrationLink>
            </Footer>
          </FormikForm>
        )}
      </Formik>
    </Container>
  );
}
