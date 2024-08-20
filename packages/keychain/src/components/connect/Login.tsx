import { Field } from "@cartridge/ui";
import { Button } from "@chakra-ui/react";
import { Container, Footer, Content, useLayout } from "components/layout";
import { useCallback, useEffect, useState } from "react";
import Controller from "utils/controller";
import { LoginMode, LoginProps } from "./types";
import { useAnalytics } from "hooks/analytics";
import { fetchAccount, validateUsernameFor } from "./utils";
import { RegistrationLink } from "./RegistrationLink";
import { useControllerTheme } from "hooks/theme";
import { doLogin } from "hooks/account";
import { useConnection } from "hooks/connection";
import { ErrorAlert } from "components/ErrorAlert";

export function Login(props: LoginProps) {
  const theme = useControllerTheme();

  return (
    <Container
      variant="connect"
      title={
        theme.id === "cartridge"
          ? "Play with Cartridge Controller"
          : `Play ${theme.name}`
      }
      description="Enter your Controller username"
    >
      <Form {...props} />
    </Container>
  );
}

function Form({
  prefilledName = "",
  isSlot,
  mode = LoginMode.Webauthn,
  onSuccess,
  onSignup,
}: LoginProps) {
  const { footer } = useLayout();
  const { origin, policies, chainId, rpcUrl, setController } = useConnection();
  const { event: log } = useAnalytics();
  const [isLoading, setIsLoading] = useState(false);
  const [expiresAt] = useState<bigint>(3000000000n);
  const [error, setError] = useState<Error>();
  const [usernameField, setUsernameField] = useState({
    value: prefilledName,
    error: undefined,
  });
  const [isValidating, setIsValidating] = useState(false);

  const onSubmit = useCallback(async () => {
    setIsValidating(true);
    const error = await validateUsernameFor("login")(usernameField.value);
    if (error) {
      setUsernameField((u) => ({ ...u, error }));
      setIsValidating(false);
      return;
    }

    setIsValidating(false);
    setIsLoading(true);

    const {
      account: {
        credentials: {
          webauthn: [{ id: credentialId, publicKey }],
        },
        contractAddress: address,
      },
    } = await fetchAccount(usernameField.value);

    try {
      const controller = new Controller({
        appId: origin,
        chainId,
        rpcUrl,
        address,
        username: usernameField.value,
        publicKey,
        credentialId,
      });

      switch (mode) {
        case LoginMode.Webauthn:
          await doLogin(usernameField.value, credentialId);
          break;
        case LoginMode.Controller:
          if (!policies?.length) {
            break;
          }

          await controller.approve(origin, expiresAt, policies);
          break;
      }

      controller.store();
      setController(controller);

      if (onSuccess) {
        onSuccess();
      }

      log({ type: "webauthn_login", address });
    } catch (e) {
      setError(e);

      log({
        type: "webauthn_login_error",
        payload: {
          error: e?.message,
        },
        address,
      });
    }

    setIsLoading(false);
  }, [
    usernameField.value,
    chainId,
    rpcUrl,
    origin,
    policies,
    expiresAt,
    mode,
    log,
    onSuccess,
    setController,
  ]);

  useEffect(() => {
    if (!isValidating || !footer.isOpen) return;
    footer.onToggle();
  }, [isValidating, footer]);
  return (
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
            setUsernameField((u) => ({
              ...u,
              value: e.target.value.toLowerCase(),
              error: undefined,
            }));
          }}
          placeholder="Username"
          error={usernameField.error}
          isLoading={isValidating}
          isDisabled={isLoading}
          onClear={() => {
            setError(undefined);
            setUsernameField((u) => ({ ...u, value: "" }));
          }}
        />
      </Content>

      <Footer isSlot={isSlot} createSession>
        {error && (
          <ErrorAlert title="Login failed" description={error.message} />
        )}
        <Button
          onClick={onSubmit}
          colorScheme="colorful"
          isLoading={isLoading}
          isDisabled={
            isValidating || !usernameField.value || !!usernameField.error
          }
        >
          Log in
        </Button>
        <RegistrationLink
          description="Need a controller?"
          onClick={() => onSignup(usernameField.value)}
        >
          Sign Up
        </RegistrationLink>
      </Footer>
    </form>
  );
}
