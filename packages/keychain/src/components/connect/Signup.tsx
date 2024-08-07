import { Field } from "@cartridge/ui";
import { Button } from "@chakra-ui/react";
import { Container, Footer, Content } from "components/layout";
import { useCallback, useEffect, useState } from "react";
import { useAccountQuery } from "generated/graphql";
import Controller from "utils/controller";
import { PopupCenter } from "utils/url";
import { SignupProps } from "./types";
import { validateUsernameFor } from "./utils";
import { RegistrationLink } from "./RegistrationLink";
import { doSignup } from "hooks/account";
import { useControllerTheme } from "hooks/theme";
import { useConnection } from "hooks/connection";
import { ErrorAlert } from "components/ErrorAlert";
import { useDeploy } from "hooks/deploy";
import { constants } from "starknet";
import { useDebounce } from "hooks/debounce";

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
  const [usernameField, setUsernameField] = useState({
    value: prefilledName,
    error: undefined,
  });
  const [isValidating, setIsValidating] = useState(false);

  const { hasPrefundRequest } = useConnection();
  const { debouncedValue: username, debouncing } = useDebounce(
    usernameField.value,
    1000,
  );

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
  }, [usernameField]);

  const onSubmit = useCallback(() => {
    setError(undefined);
    setIsRegistering(true);

    // Safari does not allow cross origin iframe to create credentials
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) {
      doPopup();
      return;
    }

    doSignup(decodeURIComponent(usernameField.value)).catch((e) => {
      // Backward compat with iframes without this permission-policy
      if (e.message.includes("publickey-credentials-create")) {
        doPopup();
        return;
      }

      setIsRegistering(false);
      setUsernameField((u) => ({ ...u, error: e.message }));
    });
  }, [usernameField, doPopup]);

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
          if (
            chainId !== constants.StarknetChainId.SN_MAIN &&
            !hasPrefundRequest
          ) {
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

          <Button
            colorScheme="colorful"
            isLoading={isRegistering}
            isDisabled={
              debouncing || !username || isValidating || !!usernameField.error
            }
            onClick={onSubmit}
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
