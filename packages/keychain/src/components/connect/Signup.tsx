import { Field } from "@cartridge/ui";
import { Button } from "@chakra-ui/react";
import { Container, Footer, Content } from "components/layout";
import { useCallback, useEffect, useState } from "react";
import { useAccountQuery } from "generated/graphql";
import Controller from "utils/controller";
import { PopupCenter } from "utils/url";
import { FormInput, SignupProps } from "./types";
import { isIframe, validateUsernameFor } from "./utils";
import { RegistrationLink } from "./RegistrationLink";
import { doSignup } from "hooks/account";
import { useControllerTheme } from "hooks/theme";
import { useConnection } from "hooks/connection";
import { useDebounce } from "hooks/debounce";
import { ErrorAlert } from "components/ErrorAlert";
import { useDeploy } from "hooks/deploy";
import { constants } from "starknet";
import { useController, useForm } from "react-hook-form";

export function Signup({
  prefilledName = "",
  isSlot,
  onSuccess,
  onLogin,
}: SignupProps) {
  const theme = useControllerTheme();
  const { chainId, rpcUrl, setController } = useConnection();
  const { deployRequest } = useDeploy();
  const [error, setError] = useState<Error>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const {
    handleSubmit,
    formState,
    control,
    setValue,
    setError: setFieldError,
    clearErrors,
  } = useForm<FormInput>({ defaultValues: { username: prefilledName } });
  const { field: usernameField } = useController({
    name: "username",
    control,
    rules: {
      required: "Username required",
      minLength: {
        value: 3,
        message: "Username must be at least 3 characters",
      },
      validate: validateUsernameFor("signup"),
    },
  });

  const { debouncedValue: username, debouncing } = useDebounce(
    usernameField.value,
    1000,
  );

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
        setFieldError(usernameField.name, {
          type: "custom",
          message: e.message,
        });
      })
      .finally(() => setIsRegistering(false));
  }, [username, setFieldError, usernameField]);

  useEffect(() => {
    if (formState.errors.username) {
      setFieldError(usernameField.name, undefined);
    }

    if (username) {
      const validate = async () => {
        setIsValidating(true);
        const message = await validateUsernameFor("signup")(username);
        if (message) {
          setValue(usernameField.name, username, { shouldTouch: true });
          setFieldError(usernameField.name, { type: "custom", message });
        }

        setIsValidating(false);
      };
      validate();
    }
  }, [
    username,
    setFieldError,
    setValue,
    clearErrors,
    usernameField.name,
    formState.errors.username,
  ]);

  // for polling approach when iframe
  useAccountQuery(
    { id: usernameField.value },
    {
      enabled: isRegistering,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      staleTime: 10000000,
      cacheTime: 10000000,
      refetchInterval: (data) => (!data ? 1000 : undefined),
      onSuccess: async (data) => {
        try {
          if (chainId !== constants.StarknetChainId.SN_MAIN) {
            await deployRequest(usernameField.value);
          }

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
            username: usernameField.value,
            publicKey,
            credentialId,
          });

          controller.store();
          setController(controller);

          if (onSuccess) {
            onSuccess();
          }
        } catch (e) {
          setError(e);
        }
      },
    },
  );

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
      <form
        style={{ width: "100%" }}
        onKeyDown={(e) => {
          e.key === "Enter" && e.preventDefault();
        }}
      >
        <Content>
          <Field
            {...usernameField}
            autoFocus
            onChange={(e) => {
              setError(undefined);
              e.target.value = e.target.value.toLowerCase();
              usernameField.onChange(e);
            }}
            placeholder="Username"
            error={formState.errors.username}
            isLoading={formState.isValidating || isValidating}
            isDisabled={isRegistering}
            onClear={() => {
              setError(undefined);
              setFieldError(usernameField.name, undefined);
              setValue(usernameField.name, "");
            }}
          />
        </Content>

        <Footer isSlot={isSlot} isSignup>
          {error && (
            <ErrorAlert title="Login failed" description={error.message} />
          )}

          <Button
            colorScheme="colorful"
            isLoading={isRegistering}
            isDisabled={
              debouncing ||
              !username ||
              !!Object.keys(formState.errors).length ||
              isValidating
            }
            onClick={handleSubmit(onSubmit)}
          >
            sign up
          </Button>
          <RegistrationLink
            description="Already have a Controller?"
            onClick={() => onLogin(usernameField.value)}
          >
            Log In
          </RegistrationLink>
        </Footer>
      </form>
    </Container>
  );
}
