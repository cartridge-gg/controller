import { Field } from "@cartridge/ui";
import { VStack, Button } from "@chakra-ui/react";
import { Container } from "../Container";
import { Form as FormikForm, Field as FormikField, Formik } from "formik";
import {
  PORTAL_FOOTER_MIN_HEIGHT,
  PortalBanner,
  PortalFooter,
} from "components";
import { useCallback, useState } from "react";
import Controller from "utils/controller";
import { FormValues, LoginProps } from "./types";
import { useAnalytics } from "hooks/analytics";
import { fetchAccount, validateUsernameFor } from "./utils";
import { RegistrationLink } from "./RegistrationLink";
import { useControllerTheme } from "hooks/theme";
import { PopupCenter } from "utils/url";
import { doLogin } from "hooks/account";
import { Error as ErrorComp } from "components/Error";

export function Login({
  prefilledName = "",
  chainId,
  context,
  isSlot,
  onSuccess,
  onSignup,
}: LoginProps) {
  const { event: log } = useAnalytics();
  const theme = useControllerTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setIsLoading(true);

      let address;
      try {
        const {
          account: {
            credentials: {
              webauthn: [{ id: credentialId, publicKey }],
            },
            contractAddress,
          },
        } = await fetchAccount(values.username);
        address = contractAddress;

        await doLogin(values.username, credentialId, publicKey);
        onSuccess(new Controller(address, publicKey, credentialId));

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
    [log, onSuccess],
  );

  return (
    <Container chainId={chainId} overflowY="auto">
      <Formik
        initialValues={{ username: prefilledName }}
        onSubmit={onSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {(props) => (
          <FormikForm style={{ width: "100%" }}>
            <PortalBanner
              title={
                theme.id === "cartridge"
                  ? "Play with Cartridge Controller"
                  : `Play ${theme.name}`
              }
              description="Enter your Controller username"
            />

            <VStack align="stretch" pb={PORTAL_FOOTER_MIN_HEIGHT}>
              <FormikField
                name="username"
                placeholder="Username"
                validate={validateUsernameFor("login")}
              >
                {({ field, meta }) => (
                  <Field
                    {...field}
                    autoFocus
                    placeholder="Username"
                    touched={meta.touched}
                    error={meta.error}
                    isLoading={props.isValidating}
                    isDisabled={isLoading}
                  />
                )}
              </FormikField>

              <ErrorComp error={error} />
            </VStack>

            <PortalFooter
              origin={context?.origin}
              policies={context?.policies}
              isSlot={isSlot}
            >
              <Button
                type="submit"
                colorScheme="colorful"
                isLoading={isLoading}
                onClick={async (ev) => {
                  // Storage request must be done in onClick rather than onSubmit
                  document.requestStorageAccess().catch((e) => {
                    console.error(e);
                    PopupCenter(
                      `/authenticate?name=${encodeURIComponent(
                        props.values.username,
                      )}&action=login`,
                      "Cartridge Login",
                      480,
                      640,
                    );

                    // Prevent onsubmit from firing
                    ev.preventDefault();
                  });
                }}
              >
                Log in
              </Button>
              <RegistrationLink
                description="Need a controller?"
                onClick={() => onSignup(props.values.username)}
              >
                Sign up
              </RegistrationLink>
            </PortalFooter>
          </FormikForm>
        )}
      </Formik>
    </Container>
  );
}
