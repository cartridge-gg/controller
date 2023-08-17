import { Field, FingerprintDuoIcon } from "@cartridge/ui";
import { VStack, Button, Spinner } from "@chakra-ui/react";
import { Container } from "../Container";
import {
  Form as FormikForm,
  Field as FormikField,
  Formik,
  useFormikContext,
} from "formik";
import { ec } from "starknet";
import { PortalFooter, PORTAL_FOOTER_MIN_HEIGHT } from "./PortalFooter";
import { PortalBanner } from "components/PortalBanner";
import { useCallback, useEffect, useState } from "react";
import Controller from "utils/controller";
import { FormValues, LoginProps } from "./types";
import { useAnalytics } from "hooks/analytics";
import { beginLogin, onLoginFinalize } from "hooks/account";
import { WebauthnSigner } from "utils/webauthn";
import base64url from "base64url";
import { AccountQuery, useAccountQuery } from "generated/graphql";
import { useClearField, useUsername } from "./hooks";
import { validateUsername } from "./validate";
import { RegistrationLink } from "./RegistrationLink";

export function Login({
  fullPage = false,
  prefilledName = "",
  chainId,
  context,
  onController,
  onComplete,
  onSignup,
}: LoginProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [account, setAccount] = useState<AccountQuery["account"]>();
  const { event: log } = useAnalytics();

  const [isAsyncValidationPassed, setIsAsyncValidationPassed] = useState(false);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      if (!isAsyncValidationPassed) {
        return;
      }

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
    [account, log, onComplete, onController, isAsyncValidationPassed],
  );

  return (
    <Container fullPage={fullPage} chainId={chainId}>
      <Formik
        initialValues={{ username: prefilledName }}
        onSubmit={onSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        <Form
          context={context}
          onSignup={onSignup}
          setAccount={setAccount}
          isLoggingIn={isLoggingIn}
          isAsyncValidationPassed={isAsyncValidationPassed}
          setIsAsyncValidationPassed={setIsAsyncValidationPassed}
        />
      </Formik>
    </Container>
  );
}

function Form({
  context,
  onSignup: onSignupProp,
  setAccount,
  isLoggingIn,
  isAsyncValidationPassed,
  setIsAsyncValidationPassed,
}: Pick<LoginProps, "context" | "onSignup"> & {
  setAccount: (account: AccountQuery["account"]) => void;
  isLoggingIn: boolean;
  isAsyncValidationPassed: boolean;
  setIsAsyncValidationPassed: (val: boolean) => void;
}) {
  const { values, setFieldError, isValid, touched } =
    useFormikContext<FormValues>();

  useEffect(() => {
    setIsAsyncValidationPassed(false);
  }, [values, setIsAsyncValidationPassed]);

  const { username, debouncing } = useUsername();

  const { error, data } = useAccountQuery(
    { id: username },
    {
      enabled: isValid,
      retry: false,
    },
  );

  useEffect(() => {
    if (!isValid) {
      return;
    }
    if (debouncing) {
      return;
    }

    if (error) {
      if ((error as Error).message === "ent: account not found") {
        setFieldError("username", "Account not found");
      } else {
        setFieldError("username", "An error occured.");
      }
    } else if (data?.account) {
      setIsAsyncValidationPassed(true);
      setAccount?.(data.account);
    }
  }, [
    error,
    data,
    debouncing,
    setFieldError,
    username,
    setAccount,
    setIsAsyncValidationPassed,
    isValid,
  ]);

  const onClearUsername = useClearField("username");

  const onSignup = useCallback(() => {
    onSignupProp(username);
  }, [onSignupProp, username]);

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
              autoFocus={true}
              placeholder="Username"
              touched={meta.touched}
              error={meta.error}
              onClear={onClearUsername}
              container={{ marginBottom: 6 }}
              isValidating={
                touched.username && isValid && !isAsyncValidationPassed
              }
            />
          )}
        </FormikField>

        <RegistrationLink description="Need a controller?" onClick={onSignup}>
          sign up
        </RegistrationLink>
      </VStack>

      <PortalFooter origin={context?.origin} policies={context?.policies}>
        <VStack
          w="full"
          alignItems="flex"
          p={4}
          bg="solid.bg"
          position="fixed"
          bottom={0}
        >
          <Button type="submit" colorScheme="colorful" isLoading={isLoggingIn}>
            Log In
          </Button>
        </VStack>
      </PortalFooter>
    </FormikForm>
  );
}
