import { Text, HStack, Link, Spacer, VStack, Divider } from "@chakra-ui/react";
import { ValidationState } from "./useUsernameValidation";
import { ExternalIcon } from "@cartridge/ui-next";
import { useMemo } from "react";

export function StatusTray({
  username,
  validation,
  error,
}: {
  username: string;
  validation: ValidationState;
  error?: Error;
}) {
  const isError = validation.status === "invalid" || error;
  const isTimeoutError = error?.message?.includes(
    "The operation either timed out or was not allowed",
  );
  const errorMessage = useMemo(() => {
    if (validation.error) {
      return validation.error.message;
    }

    if (isTimeoutError) {
      return "Passkey signing timed out or was canceled. Please try again.";
    }

    return error?.message;
  }, [validation, error, isTimeoutError]);

  return (
    <VStack
      alignItems="flex-start"
      bg="solid.secondary"
      py="8px"
      marginTop="-1rem"
      paddingTop="15px"
      backgroundColor={isError ? "red.500" : "solid.secondary"}
      borderBottomRadius="4px"
      divider={<Divider borderColor="darkGray.800" opacity="0.1" />}
    >
      <Text
        fontFamily="Inter"
        fontSize="12px"
        px="15px"
        lineHeight="16px"
        color={isError ? "darkGray.500" : "text.secondary"}
      >
        {isError ? (
          errorMessage
        ) : (
          <>
            {!username
              ? "Enter a username"
              : validation.status === "validating"
              ? "Checking username..."
              : validation.status === "valid"
              ? validation.exists
                ? "Welcome back! Select Login to play"
                : "Welcome! Let's create a new controller!"
              : validation.error?.message || "Enter a username"}
          </>
        )}
      </Text>
      {isTimeoutError && (
        <HStack fontSize="xs" w="full" px="15px">
          <Text color="darkGray.800" fontWeight="bold">
            Having trouble signing up?
          </Text>
          <Spacer />
          <HStack
            color="darkGray.800"
            cursor="pointer"
            onClick={() => {
              window.open(
                "https://docs.cartridge.gg/controller/passkey-support",
                "_blank",
              );
            }}
          >
            <Link>Controller Docs</Link>
            <ExternalIcon size="sm" />
          </HStack>
        </HStack>
      )}
    </VStack>
  );
}
