import { useEffect, useState, useRef, useCallback } from "react";
import { Container, Footer, Content } from "components/layout";
import { Field } from "@cartridge/ui";
import { Button, useMediaQuery } from "@chakra-ui/react";
import { useConnection } from "hooks/connection";
import { LoginMode } from "./types";
import { useControllerTheme } from "hooks/theme";
import { fetchAccount } from "./utils";
import { ErrorAlert } from "components/ErrorAlert";
import { usePostHog } from "posthog-js/react";
import { doLogin } from "hooks/account";
import { doSignup } from "hooks/account";
import Controller from "utils/controller";
import { useDebounce } from "hooks/debounce";
import { constants } from "starknet";
import { PopupCenter } from "utils/url";
import { useAccountQuery } from "@cartridge/utils/api/cartridge";

export function CreateController({
  isSlot,
  loginMode = LoginMode.Webauthn,
  onCreated,
}: {
  isSlot?: boolean;
  loginMode?: LoginMode;
  onCreated?: () => void;
}) {
  const posthog = usePostHog();
  const hasLoggedFocus = useRef(false);
  const hasLoggedChange = useRef(false);
  const theme = useControllerTheme();
  const { origin, policies, chainId, rpcUrl, setController } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const [isPopup, setIsPopup] = useState(false);
  const [usernameField, setUsernameField] = useState({
    value: "",
    error: undefined,
  });
  const [isValidating, setIsValidating] = useState(false);
  const [accountExists, setAccountExists] = useState<boolean>();
  const [isHeightOver600] = useMediaQuery("(min-height: 600px)");

  const { debouncedValue: username, debouncing } = useDebounce(
    usernameField.value,
    100,
  );

  // Check if account exists when username changes
  useEffect(() => {
    if (!usernameField.value) {
      setAccountExists(undefined);
      return;
    }

    const checkAccount = async () => {
      setIsValidating(true);
      try {
        // This throws if the user doesn't exist
        await fetchAccount(usernameField.value);

        // Only update state if the current value matches the debounced value
        if (usernameField.value === username) {
          setAccountExists(true);
        }
      } catch {
        if (usernameField.value === username) {
          setAccountExists(false);
        }
      }
      if (usernameField.value === username) {
        setIsValidating(false);
      }
    };

    checkAccount();
  }, [usernameField.value, username]);

  const initController = useCallback(
    async (
      username: string,
      classHash: string,
      address: string,
      credentialId: string,
      publicKey: string,
    ) => {
      const controller = new Controller({
        appId: origin,
        classHash,
        chainId,
        rpcUrl,
        address,
        username,
        publicKey,
        credentialId,
      });

      window.controller = controller;
      setController(controller);
      onCreated?.();
    },
    [origin, chainId, rpcUrl, setController, onCreated],
  );

  const doPopup = useCallback(() => {
    posthog?.capture("Do Signup Popup");

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

  const handleSubmit = useCallback(async () => {
    setError(undefined);
    setIsLoading(true);

    try {
      if (accountExists) {
        // Login flow
        const {
          account: {
            credentials: {
              webauthn: [{ id: credentialId, publicKey }],
            },
            controllers,
          },
        } = await fetchAccount(usernameField.value);

        const controllerNode = controllers.edges?.[0].node;

        if (loginMode === LoginMode.Webauthn || policies?.length === 0) {
          await doLogin({
            name: usernameField.value,
            credentialId,
            finalize: isSlot,
          });
        }

        await initController(
          usernameField.value,
          controllerNode.constructorCalldata[0],
          controllerNode.address,
          credentialId,
          publicKey,
        );
      } else {
        // Signup flow
        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent,
        );

        if (isSafari) {
          doPopup();
          return;
        }

        const data = await doSignup(
          usernameField.value,
          constants.NetworkName.SN_MAIN,
        );

        const {
          finalizeRegistration: {
            username,
            controllers,
            credentials: { webauthn },
          },
        } = data;

        const { id: credentialId, publicKey } = webauthn[0];
        const controllerNode = controllers.edges?.[0].node;

        await initController(
          username,
          controllerNode.constructorCalldata[0],
          controllerNode.address,
          credentialId,
          publicKey,
        );
      }
    } catch (e) {
      setError(e);
    }

    setIsLoading(false);
  }, [
    accountExists,
    usernameField.value,
    loginMode,
    policies,
    isSlot,
    initController,
  ]);

  useAccountQuery(
    { username: usernameField.value },
    {
      enabled: isPopup,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      staleTime: 10000000,
      cacheTime: 10000000,
      refetchInterval: (data) => (!data ? 1000 : false),
      onSuccess: async (data) => {
        try {
          const {
            account: {
              username,
              credentials: {
                webauthn: [{ id: credentialId, publicKey }],
              },
              controllers,
            },
          } = data;

          const controllerNode = controllers.edges?.[0].node;

          if (controllerNode) {
            await initController(
              username,
              controllerNode.constructorCalldata[0],
              controllerNode.address,
              credentialId,
              publicKey,
            );
          }
        } catch (e) {
          setError(e);
        }
      },
    },
  );

  return (
    <Container
      variant={isHeightOver600 ? "expanded" : "compressed"}
      title={
        theme.id === "cartridge" ? "Play with Controller" : `Play ${theme.name}`
      }
      description="Enter your username"
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
            placeholder="Username"
            onFocus={() => {
              if (!hasLoggedFocus.current) {
                posthog?.capture("Focus Username");
                hasLoggedFocus.current = true;
              }
            }}
            onChange={(e) => {
              if (!hasLoggedChange.current) {
                posthog?.capture("Change Username");
                hasLoggedChange.current = true;
              }
              setError(undefined);
              setUsernameField((u) => ({
                ...u,
                value: e.target.value.toLowerCase(),
                error: undefined,
              }));
            }}
            isLoading={isValidating}
            isDisabled={isLoading}
            onClear={() => {
              setError(undefined);
              setUsernameField((u) => ({ ...u, value: "" }));
            }}
          />
          {username && !isValidating && !debouncing && (
            <div style={{ marginTop: "8px", textAlign: "center" }}>
              {accountExists
                ? "Controller exists, sign in"
                : "Create new controller"}
            </div>
          )}
        </Content>

        <Footer showCatridgeLogo>
          {error && (
            <ErrorAlert
              title={accountExists ? "Login failed" : "Signup failed"}
              description={
                error.message.includes(
                  "The operation either timed out or was not allowed",
                )
                  ? "Passkey signing timed out or was canceled. Please try again."
                  : error.message
              }
              isExpanded
              allowToggle
            />
          )}
          <Button
            colorScheme="colorful"
            isLoading={isLoading}
            isDisabled={
              debouncing || !username || isValidating || !!usernameField.error
            }
            onClick={handleSubmit}
          >
            {accountExists ? "sign in" : "create controller"}
          </Button>
        </Footer>
      </form>
    </Container>
  );
}
