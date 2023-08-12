import { VStack, Text, HStack, Input, InputProps } from "@chakra-ui/react";
import { AlertIcon } from "./icons";

export function Field<T>({
  error,
  touched,
  ...inputProps
}: InputProps & { touched: boolean; error?: "string" }) {
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
