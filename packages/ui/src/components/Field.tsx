import {
  VStack,
  Text,
  HStack,
  Input,
  InputProps,
  InputGroup,
  InputRightElement,
  StackProps,
  Spinner,
} from "@chakra-ui/react";
import { AlertIcon, TimesCircleIcon } from "./icons";
import { useCallback, useState } from "react";
import { Loading } from "./Loading";

export function Field<T>({
  error,
  touched,
  onClear,
  container,
  isLoading,
  ...inputProps
}: InputProps & {
  touched: boolean;
  error?: string;
  onClear?: () => void;
  container: StackProps;
  isLoading?: boolean;
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

        {isLoading ? (
          <InputRightElement>
            <Loading color="text.secondary" size="12px" />
            {/** <Spinner color="text.secondary" size="sm" /> */}
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
