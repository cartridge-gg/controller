import { AlertIcon, InfoIcon, WedgeDownIcon, WarningIcon } from "@cartridge/ui";
import {
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Spacer,
  HStack,
  Box,
  VStack,
  Link,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ReactElement } from "react";
import { ErrorType, JsControllerError } from "@cartridge/account-wasm";
import { formatAddress } from "utils/contracts";

export function ErrorAlert({
  title,
  description,
  variant = "error",
  isExpanded = false,
}: {
  title: string;
  description?: string | ReactElement;
  variant?: string;
  isExpanded?: boolean;
}) {
  return (
    <Accordion
      as={motion.div}
      w="full"
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      allowToggle={!isExpanded}
      defaultIndex={isExpanded ? [0] : undefined}
      variant={variant}
      color="solid.bg"
      fontSize="sm"
    >
      <AccordionItem position="relative">
        {({ isExpanded: itemExpanded }) => (
          <>
            <AccordionButton disabled={!description || isExpanded}>
              <HStack>
                {(() => {
                  switch (variant) {
                    case "info":
                      return <InfoIcon color="info.foreground" />;
                    case "warning":
                      return <WarningIcon />;
                    case "error":
                      return <AlertIcon color="error.foreground" />;
                  }
                })()}
                <Text
                  as="b"
                  fontSize="2xs"
                  color="inherit"
                  textTransform="uppercase"
                >
                  {title}
                </Text>
              </HStack>

              <Spacer />

              {description && !isExpanded && (
                <Box
                  as={motion.div}
                  animate={{
                    rotate: itemExpanded ? 180 : 0,
                  }}
                >
                  <WedgeDownIcon boxSize={5} />
                </Box>
              )}
            </AccordionButton>

            {description && (
              <AccordionPanel maxH={200}>{description}</AccordionPanel>
            )}
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
}

export function ControllerErrorAlert({ error }: { error: JsControllerError }) {
  let title = "An error occurred";
  let description: string | React.ReactElement = error.message;
  let isExpanded = false;
  let variant = "error";

  switch (error.error_type) {
    case ErrorType.SignError:
      title = "Signing Error";
      break;
    case ErrorType.StorageError:
      title = "Storage Error";
      break;
    case ErrorType.AccountFactoryError:
      title = "Account Creation Error";
      break;
    case ErrorType.CartridgeControllerNotDeployed:
      title = "Your Controller is not deployed";
      description =
        "Lets fund your Controller and deploy it before we can start executing transactions.";
      isExpanded = true;
      variant = "info";
      break;
    case ErrorType.OriginError:
      title = "Origin Error";
      break;
    case ErrorType.EncodingError:
      title = "Encoding Error";
      break;
    case ErrorType.SerdeWasmBindgenError:
      title = "Serialization Error";
      break;
    case ErrorType.CairoSerdeError:
      title = "Cairo Serialization Error";
      break;
    case ErrorType.CairoShortStringToFeltError:
      title = "Cairo String Conversion Error";
      break;
    case ErrorType.DeviceCreateCredential:
    case ErrorType.DeviceGetAssertion:
    case ErrorType.PaymasterExecutionTimeNotReached:
      title = "Paymaster Execution Time Not Reached";
      break;
    case ErrorType.PaymasterExecutionTimePassed:
      title = "Paymaster Execution Time Passed";
      break;
    case ErrorType.PaymasterInvalidCaller:
      title = "Invalid Paymaster Caller";
      break;
    case ErrorType.PaymasterRateLimitExceeded:
      title = "Paymaster Rate Limit Exceeded";
      break;
    case ErrorType.PaymasterNotSupported:
      title = "Paymaster Not Supported";
      break;
    case ErrorType.PaymasterHttp:
      title = "Paymaster HTTP Error";
      break;
    case ErrorType.PaymasterExcecution:
      title = "Paymaster Execution Error";
      break;
    case ErrorType.PaymasterSerialization:
      title = "Paymaster Serialization Error";
      break;
    case ErrorType.DeviceBadAssertion:
    case ErrorType.DeviceChannel:
    case ErrorType.DeviceOrigin:
      title = "Device Error";
      break;
    case ErrorType.AccountSigning:
    case ErrorType.AccountProvider:
    case ErrorType.AccountClassHashCalculation:
    case ErrorType.AccountClassCompression:
    case ErrorType.AccountFeeOutOfRange:
      title = "Account Error";
      break;
    case ErrorType.ProviderRateLimited:
    case ErrorType.ProviderArrayLengthMismatch:
    case ErrorType.ProviderOther:
      title = "Provider Error";
      break;
    // Starknet errors
    case ErrorType.StarknetFailedToReceiveTransaction:
    case ErrorType.StarknetContractNotFound:
    case ErrorType.StarknetClassHashNotFound:
    case ErrorType.StarknetTransactionHashNotFound:
    case ErrorType.StarknetNoBlocks:
    case ErrorType.StarknetInvalidContinuationToken:
    case ErrorType.StarknetTooManyKeysInFilter:
    case ErrorType.StarknetContractError:
    case ErrorType.StarknetClassAlreadyDeclared:
    case ErrorType.StarknetInvalidTransactionNonce:
    case ErrorType.StarknetInsufficientMaxFee:
    case ErrorType.StarknetInsufficientAccountBalance:
    case ErrorType.StarknetValidationFailure:
    case ErrorType.StarknetCompilationFailed:
    case ErrorType.StarknetContractClassSizeIsTooLarge:
    case ErrorType.StarknetNonAccount:
    case ErrorType.StarknetDuplicateTx:
    case ErrorType.StarknetCompiledClassHashMismatch:
    case ErrorType.StarknetUnsupportedTxVersion:
    case ErrorType.StarknetUnsupportedContractClassVersion:
    case ErrorType.StarknetUnexpectedError:
    case ErrorType.StarknetNoTraceAvailable:
      title = "Starknet Error";
      break;
    case ErrorType.StarknetTransactionExecutionError:
      title = "Execution error expected";
      description = (() => {
        try {
          const errorDetails = JSON.parse(error.details);
          let executionError: string = errorDetails.execution_error;

          if (!executionError) {
            return <Text>{error.details}</Text>;
          }

          // Remove the "Transaction reverted: Transaction execution has failed:\n" prefix
          executionError = executionError.replace(
            /^Transaction reverted: Transaction execution has failed:\n/,
            "",
          );

          const stackTrace = executionError.split(/\n\d+: /);

          return <StackTraceDisplay stackTrace={stackTrace} />;
        } catch (e) {
          return <Text>{error.details}</Text>;
        }
      })();
      break;
    default:
      title = "Unknown Error";
  }

  return (
    <ErrorAlert
      title={title}
      description={description}
      variant={variant}
      isExpanded={isExpanded}
    />
  );
}

function StackTraceDisplay({ stackTrace }: { stackTrace: string[] }) {
  return (
    <VStack align="start" spacing={2}>
      {stackTrace.map((trace, index) => {
        const extractedInfo = {
          ["Address"]: trace.match(/contract address: (0x[a-fA-F0-9]+)/)?.[1],
          ["Class"]: trace.match(/class hash: (0x[a-fA-F0-9]+)/)?.[1],
          ["Selector"]: trace.match(/selector: (0x[a-fA-F0-9]+)/)?.[1],
          Error:
            trace.match(/Error at pc=.*:\n(.*)/)?.[1] ||
            trace.match(/Entry point .* not found in contract./)?.[0] ||
            trace.split("\n").slice(1).join("\n").trim() ||
            "Unknown error",
        };

        // Map "Entry point not found" error to a more human-readable message
        if (
          extractedInfo.Error &&
          extractedInfo.Error.includes("Entry point")
        ) {
          extractedInfo.Error = "Function not found in the contract";
        }

        return (
          <VStack key={index} align="start" spacing={1}>
            <VStack align="start" spacing={1} width="100%">
              {Object.entries(extractedInfo).map(
                ([key, value]) =>
                  value && (
                    <HStack
                      key={key}
                      width="100%"
                      justifyContent="space-between"
                    >
                      <Text fontWeight="bold" fontSize="sm">
                        {key}
                      </Text>
                      {key === "Address" || key === "Class" ? (
                        <Link
                          href={`https://starkscan.co/${key === "Address" ? "contract" : "class"
                            }/${value}`}
                          isExternal
                          color="link.blue"
                          fontSize="sm"
                          wordBreak="break-all"
                        >
                          {formatAddress(value, { first: 10, last: 10 })}
                        </Link>
                      ) : key === "Selector" ? (
                        <Text fontSize="sm" wordBreak="break-all">
                          {formatAddress(value, { first: 10, last: 10 })}
                        </Text>
                      ) : (
                        <Text fontSize="sm" wordBreak="break-all">
                          {value}
                        </Text>
                      )}
                    </HStack>
                  ),
              )}
            </VStack>
          </VStack>
        );
      })}
    </VStack>
  );
}
