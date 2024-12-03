import { Box, Text, HStack } from "@chakra-ui/react";
import { ValidationState } from "./useUsernameValidation";

export function StatusTray({
  username,
  validation,
  error,
}: {
  username: string;
  validation: ValidationState;
  error?: Error;
}) {
  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="row"
        alignItems="flex-start"
        padding="8px 15px"
        bg="#242824"
        marginTop="-1rem"
        paddingTop="15px"
        borderBottomRadius="4px"
      >
        <Text
          fontFamily="Inter"
          fontSize="12px"
          lineHeight="16px"
          color="#E66666"
        >
          {error.message.includes(
            "The operation either timed out or was not allowed",
          )
            ? "Passkey signing timed out or was canceled. Please try again."
            : error.message}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="flex-start"
      padding="8px 12px"
      bg="#242824"
      marginTop="-1rem"
      paddingTop="15px"
      borderBottomRadius="4px"
    >
      <HStack spacing={2}>
        <Text
          fontFamily="Inter"
          fontSize="12px"
          lineHeight="16px"
          color="#808080"
        >
          {!username
            ? "Enter a username"
            : validation.status === "validating"
            ? "Checking username..."
            : validation.status === "valid"
            ? validation.exists
              ? "Welcome back! Select Login to play"
              : "Welcome! Let's create a new controller!"
            : validation.error?.message || "Enter a username"}
        </Text>
      </HStack>
    </Box>
  );
}
