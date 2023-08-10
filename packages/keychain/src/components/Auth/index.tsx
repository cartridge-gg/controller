import { AlertIcon } from "@cartridge/ui";
import { VStack, Text, HStack, Input, InputProps } from "@chakra-ui/react";
import { ContainerV2 as Container } from "components/Container";
import {
  FieldHookConfig,
  FieldInputProps,
  FieldMetaProps,
  Form as FormikForm,
  Field as FormikField,
  Formik,
  useField,
  useFormikContext,
} from "formik";
import { constants, ec, KeyPair } from "starknet";
import { useAuth } from "./hooks";
import { PortalFooter, PORTAL_FOOTER_MIN_HEIGHT } from "./PortalFooter";
import { PortalBanner } from "./PortalBanner";
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

type AuthProps = {
  type?: "signup" | "login";
  fullPage?: boolean;
  prefilledName?: string;
  starterPackId?: string;
  chainId?: constants.StarknetChainId;
  onController?: (controller: Controller) => void;
  // onComplete?: () => void;
};

export function Auth({
  type = "login",
  fullPage = false,
  prefilledName = "",
  starterPackId,
  chainId,
  onController,
}: // onComplete,
AuthProps) {
  const [action, setAction] = useState<FormAction>("form");
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

  const onSubmit = useCallback(
    (values: FormValues) => {
      switch (action) {
        case "login": {
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
    [action, isIframe, deviceKey],
  );

  return (
    <Container fullPage={fullPage} chainId={chainId}>
      <PortalBanner type={type} />

      <Formik initialValues={{ username: prefilledName }} onSubmit={onSubmit}>
        <Form
          action={action}
          setAction={setAction}
          starterPackId={starterPackId}
          onController={onController}
          keypair={keypair}
          isRegistering={isRegistering}
        />
      </Formik>
    </Container>
  );
}

type FormAction = "form" | "signup" | "login";

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
}: Pick<AuthProps, "starterPackId" | "onController"> & {
  action: FormAction;
  setAction: (value: FormAction) => void;
  keypair: KeyPair;
  isRegistering: boolean;
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
        setAction("signup");
      } else {
        setFieldError("username", "An error occured.");
      }
    } else if (accountData?.account) {
      setAction("login");
    }
  }, [error, accountData, debouncing, setFieldError, setAction]);

  // for pulling approach when iframe
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

      <PortalFooter action={action} />
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
