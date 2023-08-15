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
import { Status } from "utils/account";
import { ResponseCodes, Error } from "@cartridge/controller";

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

        // check session
        if (context) {
          const account = controller.account(
            (context as any).transactionsDetail?.chainId ?? chainId,
          );
          const sesh = controller.session(context.origin);

          if (!sesh) {
            if (account.status === Status.COUNTERFACTUAL) {
              // TODO: Deploy?
              context.resolve({
                code: ResponseCodes.SUCCESS,
                address: controller.address,
                policies: context.policies,
              } as any);
              return;
            }

            // This device needs to be registered, so do a webauthn signature request
            // for the register transaction during the connect flow.
            if (account.status === Status.DEPLOYED) {
              try {
                await account.register();
              } catch (e) {
                context.resolve({
                  code: ResponseCodes.CANCELED,
                  message: "Canceled",
                } as Error);
                return;
              }
            }

            controller.approve(context.origin, context.policies, "");

            context.resolve({
              code: ResponseCodes.SUCCESS,
              address: controller.address,
              policies: context.policies,
            } as any);
          }
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
    [account, log, onComplete, onController, chainId, context],
  );

  return (
    <Container fullPage={fullPage}>
      <Formik initialValues={{ username: prefilledName }} onSubmit={onSubmit}>
        <Form
          context={context}
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
  context,
  // onController,
  onSignup,
  setAccount,
  isLoggingIn,
}: Pick<LoginProps, "context" | "onController" | "onSignup"> & {
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

      <PortalFooter origin={context.origin} policies={context.policies}>
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
