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
import { ErrorCode } from "@cartridge/account-wasm/controller";
import { ControllerError } from "@/utils/connection";
import { useConnection } from "@/hooks/connection";
import { constants } from "starknet";
import { parseExecutionError, parseValidationError } from "@/utils/errors";
import { formatAddress } from "@cartridge/utils";

export function ErrorAlert({
  title,
  description,
  variant = "error",
  isExpanded = false,
  allowToggle = false,
  copyText,
}: {
  title: string;
  description?: string | ReactElement;
  variant?: string;
  isExpanded?: boolean;
  allowToggle?: boolean;
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
      allowToggle={!isExpanded || allowToggle}
      defaultIndex={isExpanded ? [0] : undefined}
      variant={variant}
      color="solid.bg"
      fontSize="sm"
    >
      <AccordionItem position="relative" border="none">
        {({ isExpanded: itemExpanded }) => (
          <>
            <AccordionButton
              disabled={!description || (isExpanded && !allowToggle)}
            >
              <HStack alignItems="flex-start">
                {(() => {
                  switch (variant) {
                    case "info":
                      return <InfoIcon color="info.foreground" />;
                    case "warning":
                      return <WarningIcon color="warning.foreground" />;
                    case "error":
                      return <AlertIcon color="error.foreground" />;
                    default:
                      return null;
                  }
                })()}
                <Text
                  as="b"
                  fontSize="2xs"
                  color="inherit"
                  textTransform="uppercase"
                  align="left"
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

export function ControllerErrorAlert({
  error,
  isPaymaster = false,
}: {
  error: ControllerError;
  isPaymaster?: boolean;
}) {
  let title = "An error occurred";
  let description: string | React.ReactElement = error.message;
  let isExpanded = false;
  let variant = "error";
  let copyText: string | undefined;

  switch (error.code) {
    case ErrorCode.SignError:
      title = "Signing Error";
      if (error.message.includes("Get assertion error")) {
        description =
          "The authentication request timed out or was cancelled. Please try again.";
      }

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
    case ErrorCode.InsufficientBalance:
      title = "Insufficient funds";
      description =
        "Your controller does not have enough gas to complete this transaction";
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
    case ErrorCode.PolicyChainIdMismatch:
      title = "Invalid Policy";
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
    case ErrorCode.StarknetNoTraceAvailable:
      title = "Starknet Error";
      break;
    case ErrorCode.StarknetUnexpectedError:
      title = "Unexpected Error";
      description = error.data?.reason || JSON.stringify(error);
      break;
    case ErrorCode.StarknetTransactionExecutionError:
      try {
        const parsedError = parseExecutionError(error, isPaymaster ? 2 : 1);
        title = parsedError.summary;
        copyText = parsedError.raw;
        description = <StackTraceDisplay stackTrace={parsedError.stack} />;
      } catch (e) {
        title = "Execution error";
        description = <Text color="inherit">{error.data}</Text>;
      }
      break;
    case ErrorCode.StarknetValidationFailure:
      const parsedError = parseValidationError(error);
      title = parsedError.summary;
      copyText = parsedError.raw;
      description = (
        <VStack align="start" spacing={1} w="full">
          {Object.entries(parsedError.details).map(([key, value]) => (
            <Text
              key={key}
              wordBreak="break-all"
              color="inherit"
              textAlign="left"
            >
              {key}: {typeof value === "bigint" ? value.toString() : value}
            </Text>
          ))}
        </VStack>
      );
      variant = "warning";
      isExpanded = true;
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

function StackTraceDisplay({
  stackTrace,
}: {
  stackTrace: ReturnType<typeof parseExecutionError>["stack"];
}) {
  const { chainId } = useConnection();

  const getExplorerUrl = (type: "contract" | "class", value: string) => {
    if (!chainId) return;

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
      {stackTrace.map((trace, i, arr) => (
        <React.Fragment key={i}>
          <VStack align="start" spacing={1} w="full">
            {Object.entries(trace).map(
              ([key, value]) =>
                value && (
                  <HStack
                    key={key}
                    w="full"
                    fontSize="xs"
                    alignItems="flex-start"
                  >
                    <Text
                      color="opacityBlack.700"
                      textTransform="capitalize"
                      w="80px"
                      flexShrink={0}
                    >
                      {key}
                    </Text>
                    {key === "address" || key === "class" ? (
                      <Link
                        href={getExplorerUrl(
                          key === "address" ? "contract" : "class",
                          value as string,
                        )}
                        isExternal={isExternalLink}
                        wordBreak="break-all"
                        textAlign="left"
                      >
                        {formatAddress(value as string, {
                          size: "sm",
                        })}
                      </Link>
                    ) : key === "selector" ? (
                      <Text
                        wordBreak="break-all"
                        color="inherit"
                        textAlign="left"
                      >
                        {formatAddress(value as string, {
                          size: "sm",
                        })}
                      </Text>
                    ) : (
                      <VStack align="start" spacing={1} w="full">
                        {(value as string[]).map((line, index) => (
                          <Text
                            key={index}
                            wordBreak="break-all"
                            color="inherit"
                            textAlign="left"
                          >
                            {line}
                          </Text>
                        ))}
                      </VStack>
                    )}
                  </HStack>
                ),
            )}
          </VStack>
          {i !== arr.length - 1 && <Divider borderColor="darkGray.100" />}
        </React.Fragment>
      ))}
    </VStack>
  );
}
