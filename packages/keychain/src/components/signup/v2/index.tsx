import { AlertIcon, PlugNewDuoIcon } from "@cartridge/ui";
import { VStack, Text, HStack, Input, InputProps } from "@chakra-ui/react";
import { ContainerV2 as Container } from "components/Container";
import {
  FieldMetaProps,
  Form as FormikForm,
  Field as FormikField,
  Formik,
  useFormikContext,
} from "formik";
import { constants, ec, KeyPair } from "starknet";
import { PortalFooter, PORTAL_FOOTER_MIN_HEIGHT } from "./PortalFooter";
import { PortalBanner } from "components/PortalBanner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "hooks/debounce";
import {
  DeployAccountDocument,
  useAccountQuery,
  useStarterPackQuery,
} from "generated/graphql";
import Controller from "utils/controller";
import { Status } from "utils/account";
import { client } from "utils/graphql";
import { PopupCenter } from "utils/url";
import { FormAction } from "./types";
import { useAnalytics } from "hooks/analytics";
import { beginLogin, onLoginFinalize } from "hooks/account";
import { WebauthnSigner } from "utils/webauthn";
import base64url from "base64url";

type AuthProps = {
  type?: "signup" | "login";
  fullPage?: boolean;
  prefilledName?: string;
  starterPackId?: string;
  chainId?: constants.StarknetChainId;
  onController?: (controller: Controller) => void;
  onComplete?: () => void;
};

export function Auth({
  type = "login",
  fullPage = false,
  prefilledName = "",
  starterPackId,
  chainId,
  onController,
  onComplete,
}: AuthProps) {
  const [action, setAction] = useState<FormAction>({ type: "form" });
  const [isRegistering, setIsRegistering] = useState(false);
  const isIframe = useMemo(
    () => (typeof window !== "undefined" ? window.top !== window.self : false),
    [],
  );

  const { keypair, deviceKey } = useMemo(() => {
    const keypair = ec.genKeyPair();
    return {
      keypair,
      deviceKey: ec.getStarkKey(keypair),
    };
  }, []);

  const { event: log } = useAnalytics();
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      switch (action.type) {
        case "login": {
          log({ type: "webauthn_login" });
          setIsLoggingIn(true);

          try {
            const {
              account: {
                credential: { id: credentialId, publicKey },
                contractAddress: address,
              },
            } = action.payload;

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
        }
        case "signup": {
          setIsRegistering(true);

          // due to same origin restriction, if we're in iframe, pop up a
          // window to continue webauthn registration. otherwise,
          // display modal overlay. in either case, account is created in
          // authenticate component, so we poll and then deploy
          if (isIframe) {
            PopupCenter(
              `/authenticate?name=${encodeURIComponent(
                values.username,
              )}&pubkey=${encodeURIComponent(deviceKey)}`,
              "Cartridge Signup",
              480,
              640,
            );
          } else {
            // onAuthOpen();
          }
        }
      }
    },
    [action, log, onController, onComplete, isIframe, deviceKey],
  );

  return (
    <Container fullPage={fullPage} chainId={chainId}>
      <PortalBanner
        icon={<PlugNewDuoIcon boxSize={8} />}
        title="Sign Up"
        description="Select a username"
      />

      <Formik initialValues={{ username: prefilledName }} onSubmit={onSubmit}>
        <Form
          action={action}
          setAction={setAction}
          starterPackId={starterPackId}
          onController={onController}
          keypair={keypair}
          isRegistering={isRegistering}
          isLoggingIn={isLoggingIn}
        />
      </Formik>
    </Container>
  );
}

type FormValues = {
  username: string;
};

function Form({
  starterPackId,
  onController,
  action,
  setAction,
  keypair,
  isRegistering,
  isLoggingIn,
}: Pick<AuthProps, "starterPackId" | "onController"> & {
  action: FormAction;
  setAction: (value: FormAction) => void;
  keypair: KeyPair;
  isRegistering: boolean;
  isLoggingIn: boolean;
}) {
  const { values, errors, setFieldError } = useFormikContext<FormValues>();
  const { debouncedValue: debouncedName, debouncing } = useDebounce(
    values.username,
    1500,
  );

  const { error, data: accountData } = useAccountQuery(
    { id: debouncedName },
    {
      enabled:
        !!(debouncedName && debouncedName.length >= 3) &&
        !errors.username &&
        !isRegistering,
      retry: false,
    },
  );

  const { data: starterData } = useStarterPackQuery(
    {
      id: starterPackId,
    },
    { enabled: !!starterPackId && !isRegistering },
  );

  // check if account exists
  useEffect(() => {
    if (debouncing) {
      return;
    }

    if (error) {
      if ((error as Error).message === "ent: account not found") {
        setAction({ type: "signup" });
      } else {
        setFieldError("username", "An error occured.");
      }
    } else if (accountData?.account) {
      setAction({ type: "login", payload: accountData });
    }
  }, [error, accountData, debouncing, setFieldError, setAction]);

  // for polling approach when iframe
  useAccountQuery(
    { id: debouncedName },
    {
      enabled: isRegistering,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      staleTime: 10000000,
      cacheTime: 10000000,
      refetchInterval: (data) => (!data ? 1000 : undefined),
      onSuccess: (data) => {
        console.log("deploy request");
        const {
          account: {
            credential: { id: credentialId },
            contractAddress: address,
          },
        } = data;

        const controller = new Controller(keypair, address, credentialId);

        if (onController) onController(controller);

        controller.account(constants.StarknetChainId.TESTNET).status =
          Status.DEPLOYING;
        client
          .request(DeployAccountDocument, {
            id: debouncedName,
            chainId: "starknet:SN_GOERLI",
            starterpackIds: starterData?.game?.starterPack?.chainID?.includes(
              "SN_GOERLI",
            )
              ? [starterData?.game?.starterPack?.id]
              : undefined,
          })
          .then(() => {
            controller.account(constants.StarknetChainId.TESTNET).sync();
          });

        controller.account(constants.StarknetChainId.MAINNET).status =
          Status.DEPLOYING;
        client
          .request(DeployAccountDocument, {
            id: debouncedName,
            chainId: "starknet:SN_MAIN",
            starterpackIds: starterData?.game?.starterPack?.chainID?.includes(
              "SN_MAIN",
            )
              ? [starterData?.game?.starterPack?.id]
              : undefined,
          })
          .then(() => {
            controller.account(constants.StarknetChainId.MAINNET).sync();
          });
      },
    },
  );

  return (
    <FormikForm style={{ width: "100%" }}>
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
            />
          )}
        </FormikField>
      </VStack>

      <PortalFooter action={action} isLoggingIn={isLoggingIn} />
    </FormikForm>
  );
}

// TODO: move to component
function Field<T>({
  error,
  touched,
  ...inputProps
}: InputProps & Pick<FieldMetaProps<T>, "error" | "touched">) {
  return (
    <VStack align="flex-start">
      <Input {...inputProps} />

      {error && touched && (
        <HStack marginY={3}>
          <AlertIcon color="text.error" />
          <Text color="text.error" fontSize="sm">
            {error}
          </Text>
        </HStack>
      )}
    </VStack>
  );
}

function validateUsername(val: string) {
  if (!val) {
    return "Username required";
  } else if (val.length < 3) {
    return "Username must be at least 3 characters";
  } else if (val.split(" ").length > 1) {
    return "Username cannot contain spaces";
  }
}
