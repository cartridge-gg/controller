import { Text, VStack, Divider } from "@chakra-ui/react";
import { ValidationState } from "./useUsernameValidation";
import { ExternalIcon } from "@cartridge/ui-next";
import { useMemo } from "react";
import { Link } from "react-router-dom";

interface StatusTrayProps {
  username: string;
  validation: ValidationState;
  error?: Error;
  style?: React.CSSProperties;
}

export function StatusTray({
  username,
  validation,
  error,
  style,
}: StatusTrayProps) {
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
      marginTop="-11px"
      paddingTop="12px"
      backgroundColor={isError ? "red.500" : "solid.secondary"}
      borderBottomRadius="4px"
      divider={<Divider borderColor="darkGray.800" opacity="0.1" />}
      style={style}
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
        <div className="w-full flex items-center justify-between text-xs font-semibold px-4">
          <div>Having trouble signing up?</div>
          <Link
            className="flex items-center gap-1.5 hover:underline"
            to="https://docs.cartridge.gg/controller/passkey-support"
            target="_blank"
          >
            <div>Controller Docs</div>
            <ExternalIcon size="sm" />
          </Link>
        </div>
      )}
    </VStack>
  );
}
