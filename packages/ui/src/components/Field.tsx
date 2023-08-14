import {
  VStack,
  Text,
  HStack,
  Input,
  InputProps,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { AlertIcon, TimesCircleIcon } from "./icons";

export function Field<T>({
  error,
  touched,
  onClear,
  ...inputProps
}: InputProps & { touched: boolean; error?: "string"; onClear?: () => void }) {
  return (
    <VStack align="flex-start">
      <InputGroup>
        <Input {...inputProps} />

        {inputProps.value && onClear && (
          <InputRightElement onClick={onClear}>
            <TimesCircleIcon color="text.secondary" />
          </InputRightElement>
        )}
      </InputGroup>

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
