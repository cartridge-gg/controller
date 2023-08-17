import {
  VStack,
  Text,
  HStack,
  Input,
  InputProps,
  InputGroup,
  InputRightElement,
  StackProps,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import { AlertIcon, TimesCircleIcon } from "./icons";
import { useCallback, useState } from "react";

export function Field<T>({
  error,
  touched,
  onClear,
  container,
  isValidating,
  ...inputProps
}: InputProps & {
  touched: boolean;
  error?: string;
  onClear?: () => void;
  container: StackProps;
  isValidating: boolean;
}) {
  const [isActive, setIsActive] = useState(false);

  const onFocus = useCallback(
    (e: any) => {
      setIsActive(true);
      inputProps.onFocus?.(e);
    },
    [inputProps],
  );

  const onBlur = useCallback(
    (e: any) => {
      setIsActive(false);
      inputProps.onBlur?.(e);
    },
    [inputProps],
  );

  return (
    <VStack align="flex-start" {...container}>
      <InputGroup>
        <Input
          {...inputProps}
          onFocus={onFocus}
          onBlur={onBlur}
          isInvalid={!!error && touched}
        />

        {isValidating ? (
          <InputRightElement>
            {/** TODO: <Loading fill="text.secondary" /> */}
            <Spinner color="text.secondary" size="sm" />
          </InputRightElement>
        ) : (
          inputProps.value &&
          onClear && (
            <InputRightElement
              onClick={onClear}
              cursor={isActive ? "pointer" : "default"}
              opacity={isActive ? 100 : 0} // workaround for onBlur handler triggeres before onClear
            >
              <TimesCircleIcon color="text.secondary" boxSize={5} />
            </InputRightElement>
          )
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
