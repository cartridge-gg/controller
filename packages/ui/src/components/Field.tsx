import {
  Input,
  InputProps,
  InputGroup,
  InputRightElement,
  StackProps,
  FormControl,
  FormErrorMessage,
  HStack,
  Text,
  Spinner,
  Button,
} from "@chakra-ui/react";
import { AlertIcon, TimesCircleIcon } from "./icons";
import { forwardRef, useCallback, useState } from "react";

export const Field = forwardRef(
  (
    {
      error,
      onClear,
      onLogin,
      containerStyles,
      isLoading,
      ...inputProps
    }: InputProps & {
      error?: string;
      onClear?: () => void;
      onLogin?: () => void;
      containerStyles?: StackProps;
      isLoading?: boolean;
    },
    ref,
  ) => {
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
      <FormControl align="flex-start" {...containerStyles} isInvalid={!!error}>
        <InputGroup>
          <Input
            {...inputProps}
            onFocus={onFocus}
            onBlur={onBlur}
            isInvalid={!!error}
            ref={ref}
          />

          {isLoading ? (
            <InputRightElement>
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
                <TimesCircleIcon color="text.secondary" boxSize={6} />
              </InputRightElement>
            )
          )}
        </InputGroup>

        <FormErrorMessage>
          {error && (
            <HStack w="full" justifyContent="space-between">
              <HStack marginY={3}>
                <AlertIcon fontSize="xl" color="text.error" />
                <Text
                  color="text.error"
                  fontSize="sm"
                  w="full"
                  overflowWrap="anywhere"
                >
                  {error}
                </Text>
              </HStack>
              {error.includes("already exists") && onLogin && (
                <HStack marginY={3}>
                  <Text fontSize="sm" color="text.secondary">
                    Is this you ?
                  </Text>
                  <Button
                    variant="gohst"
                    textTransform="none"
                    p={0}
                    px={1}
                    height="24px"
                    fontFamily="Inter"
                    fontWeight="medium"
                    color="text.primary"
                    fontSize="xs"
                    borderWidth={1}
                    borderColor="solid.secondary"
                    onClick={() => onLogin()}
                  >
                    Log in
                  </Button>
                </HStack>
              )}
            </HStack>
          )}
        </FormErrorMessage>
      </FormControl>
    );
  },
);
