import {
  AlertIcon,
  InfoIcon,
  WedgeDownIcon,
  WarningIcon,
  CopyIcon,
  CheckIcon,
} from "@cartridge/ui";
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
  IconButton,
  Divider,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { ReactElement, useEffect, useState } from "react";
import { ErrorCode } from "@cartridge/account-wasm";
import { formatAddress } from "utils/contracts";
import { ControllerError } from "utils/connection";
import { useConnection } from "hooks/connection";
import { constants } from "starknet";

export function ErrorAlert({
  title,
  description,
  variant = "error",
  isExpanded = false,
  copyText,
}: {
  title: string;
  description?: string | ReactElement;
  variant?: string;
  isExpanded?: boolean;
  copyText?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  }, [copied]);

  return (
    <Accordion
      w="full"
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
                <HStack>
                  <Box
                    as={motion.div}
                    animate={{
                      rotate: itemExpanded ? 180 : 0,
                    }}
                  >
                    <WedgeDownIcon boxSize={5} />
                  </Box>
                </HStack>
              )}
            </AccordionButton>

            {description && (
              <AccordionPanel w="full" position="relative">
                {copyText && (
                  <IconButton
                    size="icon"
                    w={6}
                    h={6}
                    position="absolute"
                    right={3}
                    aria-label="Copy stacktrace"
                    icon={
                      copied ? (
                        <CheckIcon fontSize="lg" color="black" />
                      ) : (
                        <CopyIcon fontSize="lg" color="black" />
                      )
                    }
                    onClick={() => {
                      setCopied(true);
                      navigator.clipboard.writeText(copyText);
                    }}
                  />
                )}

                <Box
                  h="full"
                  maxH={200}
                  p={3}
                  pt={0}
                  overflowY="auto"
                  pr={copyText ? 10 : undefined}
                >
                  {description}
                </Box>
              </AccordionPanel>
            )}
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
}

export function ControllerErrorAlert({ error }: { error: ControllerError }) {
  let title = "An error occurred";
  let description: string | React.ReactElement = error.message;
  let isExpanded = false;
  let variant = "error";
  let copyText: string;

  switch (error.code) {
    case ErrorCode.SignError:
      title = "Signing Error";
      break;
    case ErrorCode.StorageError:
      title = "Storage Error";
      break;
    case ErrorCode.AccountFactoryError:
      title = "Account Creation Error";
      break;
    case ErrorCode.CartridgeControllerNotDeployed:
      title = "Your Controller is not deployed";
      description =
        "Lets fund your Controller and deploy it before we can start executing transactions.";
      isExpanded = true;
      variant = "warning";
      break;
    case ErrorCode.OriginError:
      title = "Origin Error";
      break;
    case ErrorCode.EncodingError:
      title = "Encoding Error";
      break;
    case ErrorCode.SerdeWasmBindgenError:
      title = "Serialization Error";
      break;
    case ErrorCode.CairoSerdeError:
      title = "Cairo Serialization Error";
      break;
    case ErrorCode.CairoShortStringToFeltError:
      title = "Cairo String Conversion Error";
      break;
    case ErrorCode.DeviceCreateCredential:
    case ErrorCode.DeviceGetAssertion:
    case ErrorCode.PaymasterExecutionTimeNotReached:
      title = "Paymaster Execution Time Not Reached";
      break;
    case ErrorCode.PaymasterExecutionTimePassed:
      title = "Paymaster Execution Time Passed";
      break;
    case ErrorCode.PaymasterInvalidCaller:
      title = "Invalid Paymaster Caller";
      break;
    case ErrorCode.PaymasterRateLimitExceeded:
      title = "Paymaster Rate Limit Exceeded";
      break;
    case ErrorCode.PaymasterNotSupported:
      title = "Paymaster Not Supported";
      break;
    case ErrorCode.PaymasterHttp:
      title = "Paymaster HTTP Error";
      break;
    case ErrorCode.PaymasterExcecution:
      title = "Paymaster Execution Error";
      break;
    case ErrorCode.PaymasterSerialization:
      title = "Paymaster Serialization Error";
      break;
    case ErrorCode.DeviceBadAssertion:
    case ErrorCode.DeviceChannel:
    case ErrorCode.DeviceOrigin:
      title = "Device Error";
      break;
    case ErrorCode.AccountSigning:
    case ErrorCode.AccountProvider:
    case ErrorCode.AccountClassHashCalculation:
    case ErrorCode.AccountClassCompression:
    case ErrorCode.AccountFeeOutOfRange:
      title = "Account Error";
      break;
    case ErrorCode.ProviderRateLimited:
    case ErrorCode.ProviderArrayLengthMismatch:
    case ErrorCode.ProviderOther:
      title = "Provider Error";
      break;
    // Starknet errors
    case ErrorCode.StarknetFailedToReceiveTransaction:
    case ErrorCode.StarknetContractNotFound:
    case ErrorCode.StarknetClassHashNotFound:
    case ErrorCode.StarknetTransactionHashNotFound:
    case ErrorCode.StarknetNoBlocks:
    case ErrorCode.StarknetInvalidContinuationToken:
    case ErrorCode.StarknetTooManyKeysInFilter:
    case ErrorCode.StarknetContractError:
    case ErrorCode.StarknetClassAlreadyDeclared:
    case ErrorCode.StarknetInvalidTransactionNonce:
    case ErrorCode.StarknetInsufficientMaxFee:
    case ErrorCode.StarknetInsufficientAccountBalance:
    case ErrorCode.StarknetValidationFailure:
    case ErrorCode.StarknetCompilationFailed:
    case ErrorCode.StarknetContractClassSizeIsTooLarge:
    case ErrorCode.StarknetNonAccount:
    case ErrorCode.StarknetDuplicateTx:
    case ErrorCode.StarknetCompiledClassHashMismatch:
    case ErrorCode.StarknetUnsupportedTxVersion:
    case ErrorCode.StarknetUnsupportedContractClassVersion:
    case ErrorCode.StarknetUnexpectedError:
    case ErrorCode.StarknetNoTraceAvailable:
      title = "Starknet Error";
      break;
    case ErrorCode.StarknetTransactionExecutionError:
      title = "Execution error expected";
      description = (() => {
        try {
          let executionError: string = error.data.execution_error;
          if (!executionError) {
            console.log(typeof error.data);
            return <Text color="inherit">{JSON.stringify(error.data)}</Text>;
          }

          // Remove the "Transaction reverted: Transaction execution has failed:\n" prefix
          executionError = executionError.replace(
            /^Transaction reverted: Transaction execution has failed:\n/,
            "",
          );
          copyText = executionError;

          const stackTrace = executionError.split(/\n\d+: /);

          return <StackTraceDisplay stackTrace={stackTrace} />;
        } catch (e) {
          return <Text color="inherit">{error.data}</Text>;
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
      copyText={copyText}
    />
  );
}

function StackTraceDisplay({ stackTrace }: { stackTrace: string[] }) {
  const { chainId } = useConnection();

  const getExplorerUrl = (type: "contract" | "class", value: string) => {
    const baseUrl = {
      [constants.StarknetChainId.SN_SEPOLIA]: "https://sepolia.starkscan.co",
      [constants.StarknetChainId.SN_MAIN]: "https://starkscan.co",
    }[chainId];

    return baseUrl ? `${baseUrl}/${type}/${value}` : undefined;
  };

  const isExternalLink = [
    constants.StarknetChainId.SN_SEPOLIA,
    constants.StarknetChainId.SN_MAIN,
  ].includes(chainId as constants.StarknetChainId);

  return (
    <VStack align="start" spacing={2} w="full">
      {stackTrace.map((trace, i, arr) => {
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
          <React.Fragment key={i}>
            <VStack align="start" spacing={1} w="full">
              {Object.entries(extractedInfo).map(
                ([key, value]) =>
                  value && (
                    <HStack
                      key={key}
                      w="full"
                      justifyContent="space-between"
                      fontSize="xs"
                    >
                      <Text color="darkGray.400">{key}</Text>
                      {key === "Address" || key === "Class" ? (
                        <Link
                          href={getExplorerUrl(
                            key === "Address" ? "contract" : "class",
                            value,
                          )}
                          isExternal={isExternalLink}
                          wordBreak="break-all"
                        >
                          {formatAddress(value, { first: 10, last: 10 })}
                        </Link>
                      ) : key === "Selector" ? (
                        <Text wordBreak="break-all" color="inherit">
                          {formatAddress(value, { first: 10, last: 10 })}
                        </Text>
                      ) : (
                        <Text wordBreak="break-all" color="inherit">
                          {value}
                        </Text>
                      )}
                    </HStack>
                  ),
              )}
            </VStack>
            {i !== arr.length - 1 && <Divider borderColor="darkGray.100" />}
          </React.Fragment>
        );
      })}
    </VStack>
  );
}
