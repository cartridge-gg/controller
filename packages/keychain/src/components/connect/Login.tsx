import { Field } from "@cartridge/ui";
import { Button } from "@chakra-ui/react";
import { Container, Footer, Content, useLayout } from "components/layout";
import {
  SubmitHandler,
  useForm,
  useController as useFormikController,
} from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import Controller from "utils/controller";
import { FormInput, LoginMode, LoginProps } from "./types";
import { fetchAccount, validateUsernameFor } from "./utils";
import { RegistrationLink } from "./RegistrationLink";
import { useControllerTheme } from "hooks/theme";
import { doLogin } from "hooks/account";
import { useConnection } from "hooks/connection";
import { ErrorAlert } from "components/ErrorAlert";
import { useDeploy } from "hooks/deploy";

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
  const { deployRequest } = useDeploy();
  const [isLoading, setIsLoading] = useState(false);
  const [expiresAt] = useState<bigint>(3000000000n);
  const [error, setError] = useState<Error>();

  const { handleSubmit, formState, control, setValue } = useForm<FormInput>({
    defaultValues: { username: prefilledName },
  });
  const { field: usernameField } = useFormikController({
    name: "username",
    control,
    rules: {
      required: "Username required",
      minLength: {
        value: 3,
        message: "Username must be at least 3 characters",
      },
      validate: validateUsernameFor("login"),
    },
  });

  const onSubmit: SubmitHandler<FormInput> = useCallback(
    async (values) => {
      setIsLoading(true);

      const {
        account: {
          credentials: {
            webauthn: [{ id: credentialId, publicKey }],
          },
          contractAddress: address,
        },
      } = await fetchAccount(values.username);

      try {
        const controller = new Controller({
          chainId,
          rpcUrl,
          address,
          username: values.username,
          publicKey,
          credentialId,
        });

        switch (mode) {
          case LoginMode.Webauthn:
            await doLogin(values.username, credentialId);
            break;
          case LoginMode.Controller:
            if (policies.length === 0) {
              throw new Error("Policies required for controller ");
            }

            await controller.approve(origin, expiresAt, policies);
            break;
        }

        if (isSlot) {
          await deployRequest(values.username);
        }

        if (onSuccess) {
          onSuccess();
        }

        controller.store();
        setController(controller);
      } catch (e) {
        if (e.message.includes("account already deployed")) {
          return;
        }

        setError(e);
      }

      setIsLoading(false);
    },
    [
      chainId,
      rpcUrl,
      origin,
      policies,
      expiresAt,
      mode,
      onSuccess,
      setController,
    ],
  );

  useEffect(() => {
    if (!formState.isValidating || !footer.isOpen) return;
    footer.onToggle();
  }, [formState.isValidating, footer]);
  return (
    <form
      style={{ width: "100%" }}
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => setError(undefined)}
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
          isLoading={formState.isValidating}
          isDisabled={isLoading}
          onClear={() => {
            setError(undefined);
            setValue(usernameField.name, "");
          }}
        />
      </Content>

      <Footer isSlot={isSlot} createSession>
        {error && (
          <ErrorAlert title="Login failed" description={error.message} />
        )}
        <Button type="submit" colorScheme="colorful" isLoading={isLoading}>
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
