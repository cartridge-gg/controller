import { AlertIcon } from "@cartridge/ui";
import { VStack, Text, HStack, Input } from "@chakra-ui/react";
import { ContainerV2 as Container } from "components/Container";
import { FieldHookConfig, Form, Formik, useField } from "formik";
import { constants } from "starknet";
import { useAuth } from "./hooks";
import { PortalFooter, PORTAL_FOOTER_MIN_HEIGHT } from "./PortalFooter";
import { PortalBanner } from "./PortalBanner";
import { useEffect } from "react";

type AuthProps = {
  type?: "signup" | "login";
  fullPage?: boolean;
  prefilledName?: string;
  // starterPackId?: string;
  chainId?: constants.StarknetChainId;
};

export function Auth({
  type = "login",
  fullPage = false,
  prefilledName = "",
  // starterPackId,
  chainId,
}: AuthProps) {
  const { name, validateName, onSubmit } = useAuth({
    prefilledName,
    // starterPackId,
  });

  return (
    <Container fullPage={fullPage} chainId={chainId}>
      <PortalBanner type={type} />

      <Formik initialValues={{ name }} onSubmit={onSubmit}>
        <Form style={{ width: "100%" }}>
          <VStack align="stretch" paddingBottom={PORTAL_FOOTER_MIN_HEIGHT}>
            <Field name="name" placeholder="Username" validate={validateName} />
          </VStack>
        </Form>
      </Formik>

      <PortalFooter />
    </Container>
  );
}

function Field<T>({
  name,
  placeholder,
}: FieldHookConfig<T> & { placeholder: string }) {
  const [field, meta, { setError }] = useField(name);

  useEffect(() => {
    setError("hey");
  }, []);

  return (
    <VStack align="flex-start">
      <Input placeholder={placeholder} {...field} />
      {meta.error && (
        <HStack marginY={3}>
          <AlertIcon color="text.error" />
          <Text color="text.error" fontSize="sm">
            {meta.error}
          </Text>
        </HStack>
      )}
    </VStack>
  );
}
