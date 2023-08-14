import { Field, FingerprintDuoIcon } from "@cartridge/ui";
import { VStack, Button } from "@chakra-ui/react";
import { Container } from "../Container";
import { Form as FormikForm, Field as FormikField, Formik } from "formik";
import { ec } from "starknet";
import { PortalFooter, PORTAL_FOOTER_MIN_HEIGHT } from "./PortalFooter";
import { PortalBanner } from "components/PortalBanner";
import { useCallback, useState } from "react";
import Controller from "utils/controller";
import { FormValues, LoginProps } from "./types";
import { useAnalytics } from "hooks/analytics";
import { beginLogin, onLoginFinalize } from "hooks/account";
import { WebauthnSigner } from "utils/webauthn";
import base64url from "base64url";
import { AccountQuery } from "generated/graphql";
import { useClearField, useSubmitType, useUsername } from "./hooks";
import { validateUsername } from "./validate";

export function Login({
  fullPage = false,
  prefilledName = "",
  origin,
  policies,
  onController,
  onComplete,
  onSignup,
}: LoginProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [account, setAccount] = useState<AccountQuery["account"]>();
  const { event: log } = useAnalytics();

  const onSubmit = useCallback(
    async (values: FormValues) => {
      log({ type: "webauthn_login" });
      setIsLoggingIn(true);

      try {
        const {
          credential: { id: credentialId, publicKey },
          contractAddress: address,
        } = account;

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
          onController(controller);
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
    [account, log, onComplete, onController],
  );

  return (
    <Container fullPage={fullPage}>
      <Formik initialValues={{ username: prefilledName }} onSubmit={onSubmit}>
        <Form
          origin={origin}
          policies={policies}
          onController={onController}
          onSignup={onSignup}
          setAccount={setAccount}
          isLoggingIn={isLoggingIn}
        />
      </Formik>
    </Container>
  );
}

function Form({
  origin,
  policies,
  // onController,
  onSignup,
  setAccount,
  isLoggingIn,
}: Pick<LoginProps, "origin" | "policies" | "onController" | "onSignup"> & {
  setAccount: (account: AccountQuery["account"]) => void;
  isLoggingIn: boolean;
}) {
  const { username, debouncing } = useUsername();
  const submitType = useSubmitType(username, {
    onAccount: setAccount,
    debouncing,
  });
  const onClearUsername = useClearField("username");

  return (
    <FormikForm style={{ width: "100%" }}>
      <PortalBanner
        icon={<FingerprintDuoIcon boxSize={8} />}
        title="Log In"
        description="Enter your username"
      />

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

      <PortalFooter origin={origin} policies={policies}>
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
            isDisabled={submitType !== "login"}
            isLoading={isLoggingIn}
          >
            Log In
          </Button>

          <Button
            type="submit"
            isDisabled={submitType !== "signup"}
            onClick={() => onSignup(username)}
          >
            Sign Up
          </Button>
        </VStack>
      </PortalFooter>
    </FormikForm>
  );
}
