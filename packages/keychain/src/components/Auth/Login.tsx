import { Field, FingerprintDuoIcon, Loading } from "@cartridge/ui";
import { VStack, Button } from "@chakra-ui/react";
import { Container } from "../Container";
import {
  Form as FormikForm,
  Field as FormikField,
  Formik,
  useFormikContext,
} from "formik";
import { ec, number } from "starknet";
import {
  PortalBanner,
  PortalFooter,
  PORTAL_FOOTER_MIN_HEIGHT,
} from "components";
import { useCallback, useState } from "react";
import base64url from "base64url";
import { AccountType } from "generated/graphql";
import { useAnalytics } from "hooks/analytics";
import { beginLogin, onLoginFinalize } from "hooks/account";
import { computeAddress } from "methods/register";
import Controller from "utils/controller";
import { WebauthnSigner } from "utils/webauthn";
import web3auth from "utils/web3auth";
import { useClearField } from "./hooks";
import { FormValues, LoginProps } from "./types";
import { fetchAccount, validateUsernameFor } from "./utils";
import { RegistrationLink } from "./RegistrationLink";
import { Web3Auth } from "./Web3Auth";
import { WALLET_ADAPTERS } from "@web3auth/base";

export function Login({
  prefilledName = "",
  chainId,
  context,
  isSlot,
  onController,
  onComplete,
  onSignup,
}: LoginProps) {
  const [accountType, setAccountType] = useState();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { event: log } = useAnalytics();

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setIsLoggingIn(true);

      try {
        const { account } = await fetchAccount(values.username);

        switch (account.type) {
          case AccountType.Webauthn: {
            log({ type: "webauthn_login" });
            const {
              credentials: {
                webauthn: [{ id: credentialId, publicKey }],
              },
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
          }
          case AccountType.Discord: {
            if (!web3auth) {
              console.error("web3auth not initialized yet");
              return;
            }
            const web3authProvider = await web3auth.connectTo(
              WALLET_ADAPTERS.OPENLOGIN,
              { loginProvider },
            );
            const { oAuthAccessToken } = await web3auth.getUserInfo();
            const privateKey: string = await web3authProvider.request({
              method: "private_key",
            });
            const keyPair = ec.getKeyPair(number.toBN(privateKey, "hex"));
            const address = computeAddress(
              values.username,
              { x0: number.toBN(0), x1: number.toBN(0), x2: number.toBN(0) },
              { y0: number.toBN(0), y1: number.toBN(0), y2: number.toBN(0) },
              ec.getStarkKey(keyPair),
            );
            const controller = new Controller(keyPair, address, loginProvider);
            // onAuth(controller, oAuthAccessToken);
            await client.request(DiscordRevokeDocument, {
              token: token,
            });

            if (onController) {
              onController(controller);
            }

            if (onComplete) {
              onComplete();
            }
          }
          // case AccountType.Injected: {
          //   return;
          // }
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
          accountType={accountType}
          onDiscordAuth={onSubmit}
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
  accountType,
  onDiscordAuth,
}: Pick<LoginProps, "context" | "isSlot" | "onSignup"> & {
  isLoggingIn: boolean;
  accountType: AccountType | undefined;
  onDiscordAuth: () => Promise<void>;
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

        {accountType === AccountType.Discord && (
          <Web3Auth
            username={debouncedName}
            onAuth={onDiscordAuth}
            // onAuth={async (controller, token) => {
            //   await client.request(DiscordRevokeDocument, {
            //     token: token,
            //   });

            //   if (onController) {
            //     onController(controller);
            //   }

            //   if (onComplete) {
            //     onComplete();
            //   }
            // }}
          />
        )}
      </PortalFooter>
    </FormikForm>
  );
}
