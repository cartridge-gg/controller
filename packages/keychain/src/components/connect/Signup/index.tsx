import { ArgentIcon, Field } from "@cartridge/ui";
import { Button, HStack } from "@chakra-ui/react";
import { Container, Footer, Content } from "components/layout";
import { useCallback, useEffect, useState } from "react";
import {
  FinalizeRegistrationMutation,
  useAccountQuery,
} from "generated/graphql";
import Controller from "utils/controller";
import { PopupCenter } from "utils/url";
import { SignupProps } from "../types";
import { validateUsernameFor } from "../utils";
import { RegistrationLink } from "../RegistrationLink";
import { doSignup } from "hooks/account";
import { useControllerTheme } from "hooks/theme";
import { useConnection } from "hooks/connection";
import { ErrorAlert } from "components/ErrorAlert";
import { useDebounce } from "hooks/debounce";
import { SignupArgent } from "./Argent";

enum SignupMethod {
  WEBAUTHN,
  ARGENT,
  SOCIAL,
}

export function Signup({
  prefilledName = "",
  isSlot,
  onSuccess,
  onLogin,
}: SignupProps) {
  const theme = useControllerTheme();
  const { chainId, rpcUrl, setController } = useConnection();
  console.log({ chainId, rpcUrl });
  const [error, setError] = useState<Error>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [usernameField, setUsernameField] = useState({
    value: prefilledName,
    error: undefined,
  });
  const [isValidating, setIsValidating] = useState(false);
  const [signupMethod, setSignupMethod] = useState<SignupMethod>(
    SignupMethod.WEBAUTHN,
  );

  const { origin } = useConnection();
  const { debouncedValue: username, debouncing } = useDebounce(
    usernameField.value,
    1000,
  );

  console.debug("signup render");

  // In order for Safari to open "Create Passkey" modal successfully, submit handler has to be async.
  // The workaround is to call async validation function every time when username input changes
  useEffect(() => {
    setError(undefined);

    if (username) {
      const validate = async () => {
        setIsValidating(true);
        const error = await validateUsernameFor("signup")(username);
        if (error) {
          setUsernameField((u) => ({ ...u, error }));
        } else {
          setUsernameField((u) => ({ ...u, error: undefined }));
        }

        setIsValidating(false);
      };
      validate();
    }
  }, [username]);

  const initController = useCallback(
    async (
      username: string,
      address?: string,
      credentialId?: string,
      publicKey?: string,
    ) => {
      const controller = new Controller({
        appId: origin,
        chainId,
        rpcUrl,
        address,
        username,
        publicKey,
        credentialId,
      });

      controller.store();
      setController(controller);

      if (onSuccess) {
        onSuccess();
      }
    },
    [origin, chainId, rpcUrl, onSuccess, setController],
  );

  const doPopup = useCallback(() => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("name", encodeURIComponent(usernameField.value));
    searchParams.set("action", "signup");

    PopupCenter(
      `/authenticate?${searchParams.toString()}`,
      "Cartridge Signup",
      480,
      640,
    );

    setIsPopup(true);
  }, [usernameField]);

  const onSubmit = useCallback(async () => {
    setError(undefined);
    setIsRegistering(true);

    // Safari does not allow cross origin iframe to create credentials
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) {
      doPopup();
      return;
    }

    try {
      const data: FinalizeRegistrationMutation = await doSignup(
        usernameField.value,
      );
      const {
        finalizeRegistration: {
          id: username,
          contractAddress: address,
          credentials: { webauthn },
        },
      } = data;

      const { id: credentialId, publicKey } = webauthn[0];

      initController(username, address, credentialId, publicKey);
    } catch (e) {
      // Backward compat with iframes without this permission-policy
      if (e.message.includes("publickey-credentials-create")) {
        doPopup();
        return;
      }

      setIsRegistering(false);
      setUsernameField((u) => ({ ...u, error: e.message }));
    }
  }, [usernameField, initController, doPopup]);

  // for polling approach when popup
  useAccountQuery(
    { id: usernameField.value },
    {
      enabled: isPopup,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      staleTime: 10000000,
      cacheTime: 10000000,
      refetchInterval: (data) => (!data ? 1000 : undefined),
      onSuccess: async (data) => {
        try {
          const {
            account: {
              credentials: {
                webauthn: [{ id: credentialId, publicKey }],
              },
              contractAddress: address,
            },
          } = data;

          initController(username, address, credentialId, publicKey);
        } catch (e) {
          setError(e);
        }
      },
    },
  );

  if (signupMethod === SignupMethod.ARGENT) {
    return <SignupArgent username={usernameField.value} />;
  }

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
            placeholder="Username"
            autoFocus
            onChange={(e) => {
              setError(undefined);
              setUsernameField((u) => ({
                ...u,
                value: e.target.value.toLowerCase(),
              }));
            }}
            isLoading={isValidating}
            isDisabled={isRegistering}
            onClear={() => {
              setError(undefined);
              setUsernameField((u) => ({ ...u, value: "" }));
            }}
          />
        </Content>

        <Footer isSlot={isSlot} isSignup>
          {error && (
            <ErrorAlert title="Login failed" description={error.message} />
          )}

          <HStack>
            <Button
              w="100%"
              colorScheme="colorful"
              isLoading={isRegistering}
              isDisabled={
                debouncing || !username || isValidating || !!usernameField.error
              }
              onClick={onSubmit}
            >
              sign up
            </Button>
            {document.cookie.includes("argent") && (
              // {typeof window !== "undefined" && window["starknet_argentX"] && (
              <Button
                colorScheme="colorful"
                isLoading={isRegistering}
                isDisabled={
                  debouncing ||
                  !username ||
                  isValidating ||
                  !!usernameField.error
                }
                onClick={() => setSignupMethod(SignupMethod.ARGENT)}
              >
                <ArgentIcon />
              </Button>
            )}
          </HStack>
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
