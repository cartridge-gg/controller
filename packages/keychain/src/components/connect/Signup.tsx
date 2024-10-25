import { TimesCircleIcon } from "@cartridge/ui";
import {
  Button,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  useMediaQuery,
} from "@chakra-ui/react";
import { Container, Footer, Content } from "components/layout";
import { useCallback, useEffect, useState } from "react";
import {
  FinalizeRegistrationMutation,
  useAccountQuery,
} from "@cartridge/utils/api/cartridge";
import Controller from "utils/controller";
import { PopupCenter } from "utils/url";
import { SignupProps } from "./types";
import { validateUsernameFor } from "./utils";
import { RegistrationLink } from "./RegistrationLink";
import { doSignup } from "hooks/account";
import { useControllerTheme } from "hooks/theme";
import { useConnection } from "hooks/connection";
import { ErrorAlert } from "components/ErrorAlert";
import { useDebounce } from "hooks/debounce";
import { constants } from "starknet";

export function Signup({
  prefilledName = "",
  isSlot,
  onSuccess,
  onLogin,
}: SignupProps) {
  const theme = useControllerTheme();
  const { chainId, rpcUrl, setController } = useConnection();
  const [error, setError] = useState<Error>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [usernameField, setUsernameField] = useState({
    value: prefilledName,
    error: undefined,
  });
  const [isValidating, setIsValidating] = useState(false);

  const { origin } = useConnection();
  const { debouncedValue: username, debouncing } = useDebounce(
    usernameField.value,
    1000,
  );
  const [isHeightOver600] = useMediaQuery("(min-height: 600px)");

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
        //shortString.decodeShortString(chainId),
        constants.NetworkName.SN_MAIN, // hardcode to main till multi-signers is complete
      );
      const {
        finalizeRegistration: {
          id: username,
          controllers,
          credentials: { webauthn },
        },
      } = data;

      const { id: credentialId, publicKey } = webauthn[0];
      const controllerNode = controllers.edges?.[0].node;

      initController(
        username,
        controllerNode.constructorCalldata[0],
        controllerNode.address,
        credentialId,
        publicKey,
      );
    } catch (e) {
      if (
        // Backward compat with iframes without this permission-policy
        e.message.includes("publickey-credentials-create") ||
        // Bitwarden extension
        e.message.includes("Invalid 'sameOriginWithAncestors' value") ||
        // Other password manager
        e.message.includes("document which is same-origin")
      ) {
        doPopup();
        return;
      }

      setIsRegistering(false);
      setError(e);
    }
  }, [usernameField, chainId, initController, doPopup]);

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
              controllers,
            },
          } = data;

          const controllerNode = controllers.edges?.[0].node;

          initController(
            username,
            controllerNode.constructorCalldata[0],
            controllerNode.address,
            credentialId,
            publicKey,
          );
        } catch (e) {
          setError(e);
        }
      },
    },
  );

  const [isActive, setIsActive] = useState(false);

  return (
    <Container
      variant={isHeightOver600 ? "expanded" : "compressed"}
      title={
        theme.id === "cartridge" ? "Play with Controller" : `Play ${theme.name}`
      }
      description="Create your onchain player identity"
    >
      <form
        style={{ width: "100%" }}
        onKeyDown={(e) => {
          e.key === "Enter" && e.preventDefault();
        }}
      >
        <Content>
          <FormControl
            alignItems="flex-start"
            isInvalid={!!usernameField.error}
          >
            <InputGroup>
              <Input
                placeholder="Username"
                isDisabled={isRegistering}
                onChange={(e) => {
                  setError(undefined);
                  setUsernameField((u) => ({
                    ...u,
                    value: e.target.value.toLowerCase(),
                  }));
                }}
                onFocus={() => {
                  setIsActive(true);
                }}
                onBlur={() => {
                  setIsActive(false);
                }}
                isInvalid={!!usernameField.error}
              />

              {isValidating ? (
                <InputRightElement>
                  <Spinner color="text.secondary" size="sm" />
                </InputRightElement>
              ) : (
                usernameField.value && (
                  <InputRightElement
                    onClick={() => {
                      setError(undefined);
                      setUsernameField((u) => ({ ...u, value: "" }));
                    }}
                    cursor={isActive ? "pointer" : "default"}
                    opacity={isActive ? 100 : 0} // workaround for onBlur handler triggeres before onClear
                    h="full"
                  >
                    <TimesCircleIcon color="text.secondary" boxSize={6} />
                  </InputRightElement>
                )
              )}
            </InputGroup>

            <FormErrorMessage>
              {usernameField.error && (
                <HStack flex={1} marginY={3} justify="space-between">
                  <Text
                    color="alert.foreground"
                    fontSize="sm"
                    w="full"
                    overflowWrap="anywhere"
                  >
                    {usernameField.error}
                  </Text>

                  {usernameField.error?.includes(
                    `Sorry, ${usernameField.value} already exists.`,
                  ) && (
                    <HStack gap={1}>
                      <Text whiteSpace="nowrap" color="text.secondary">
                        Is this you?
                      </Text>
                      <Button
                        onClick={() => onLogin(usernameField.value)}
                        variant="ghost"
                        textTransform="capitalize"
                        fontFamily="Inter"
                        size="sm"
                        color="text.secondaryAccent"
                      >
                        Log In
                      </Button>
                    </HStack>
                  )}
                </HStack>
              )}
            </FormErrorMessage>
          </FormControl>
        </Content>

        <Footer isSlot={isSlot} isSignup showCatridgeLogo>
          {error && (
            <ErrorAlert
              title="Signup failed"
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
