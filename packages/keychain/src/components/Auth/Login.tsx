import { Field, FingerprintDuoIcon, Loading } from "@cartridge/ui";
import { VStack, Button } from "@chakra-ui/react";
import { Container } from "../Container";
import {
  Form as FormikForm,
  Field as FormikField,
  Formik,
  useFormikContext,
} from "formik";
import { ec } from "starknet";
import {
  PortalBanner,
  PortalFooter,
  PORTAL_FOOTER_MIN_HEIGHT,
} from "components";
import { useCallback, useState } from "react";
import Controller from "utils/controller";
import { FormValues, LoginProps } from "./types";
import { useAnalytics } from "hooks/analytics";
import { beginLogin, onLoginFinalize } from "hooks/account";
import { WebauthnSigner } from "utils/webauthn";
import base64url from "base64url";
import { useClearField } from "./hooks";
import { fetchAccount, validateUsernameFor } from "./utils";
import { RegistrationLink } from "./RegistrationLink";

export function Login({
  prefilledName = "",
  chainId,
  context,
  isSlot,
  onController,
  onComplete,
  onSignup,
}: LoginProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { event: log } = useAnalytics();

  const onSubmit = useCallback(
    async (values: FormValues) => {
      log({ type: "webauthn_login" });
      setIsLoggingIn(true);

      try {
        const {
          account: {
            credentials: {
              webauthn: [{ id: credentialId, publicKey }],
            },
            contractAddress: address,
          },
        } = await fetchAccount(values.username);

        const { data: beginLoginData } = await beginLogin(values.username);
        const signer = new WebauthnSigner(credentialId, publicKey);

        const assertion = await signer.sign(
          base64url.toBuffer(beginLoginData.beginLogin.publicKey.challenge),
        );

        const res = await onLoginFinalize(assertion);
        if (!res.finalizeLogin) {
          throw Error("login failed");
        }

        const keypair = ec.genKeyPair();
        const controller = new Controller(keypair, address, credentialId);

        if (onController) {
          await onController(controller);
        }

        if (onComplete) {
          onComplete();
        }
      } catch (err) {
        setIsLoggingIn(false);
        log({
          type: "webauthn_login_error",
          payload: {
            error: err?.message,
          },
        });
      }
    },
    [log, onComplete, onController],
  );

  return (
    <Container chainId={chainId}>
      <Formik
        initialValues={{ username: prefilledName }}
        onSubmit={onSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        <Form
          context={context}
          isSlot={isSlot}
          onSignup={onSignup}
          isLoggingIn={isLoggingIn}
        />
      </Formik>
    </Container>
  );
}

function Form({
  context,
  isSlot,
  onSignup: onSignupProp,
  isLoggingIn,
}: Pick<LoginProps, "context" | "isSlot" | "onSignup"> & {
  isLoggingIn: boolean;
}) {
  const { values, isValidating } = useFormikContext<FormValues>();

  const onClearUsername = useClearField("username");

  const onSignup = useCallback(() => {
    onSignupProp(values.username);
  }, [onSignupProp, values]);

  return (
    <FormikForm style={{ width: "100%" }}>
      <PortalBanner
        Icon={FingerprintDuoIcon}
        title="Log In"
        description="Enter your username"
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
              onClear={onClearUsername}
              container={{ mb: 6 }}
              isLoading={isValidating}
            />
          )}
        </FormikField>

        <RegistrationLink description="Need a controller?" onClick={onSignup}>
          sign up
        </RegistrationLink>
      </VStack>

      <PortalFooter
        origin={context?.origin}
        policies={context?.policies}
        isSlot={isSlot}
      >
        <Button
          type="submit"
          colorScheme="colorful"
          isLoading={isLoggingIn}
          spinner={<Loading color="solid.primary" />}
        >
          log in
        </Button>
      </PortalFooter>
    </FormikForm>
  );
}
