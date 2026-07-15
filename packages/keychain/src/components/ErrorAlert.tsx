import { ControllerError } from "@/utils/connection";
import {
  parseExecutionError,
  parseValidationError,
  parseGraphQLError,
  ExternalWalletError,
  type GraphQLErrorDetails,
  type ErrorWithGraphQL,
} from "@/utils/errors";
import { humanizeString } from "@cartridge/controller";
import { ErrorCode } from "@cartridge/controller-wasm/controller";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  CheckIcon,
  CopyIcon,
  ErrorAlertIcon,
  ErrorAlertIconProps,
  Separator,
} from "@cartridge/controller-ui";
import { cn, formatAddress } from "@cartridge/controller-ui/utils";
import { useExplorer } from "@starknet-react/core";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useAdvancedView } from "@/hooks/features";

export function ErrorAlert({
  title,
  description,
  variant = "error",
  isExpanded = false,
  allowToggle = false,
  copyText,
  className,
}: {
  title: string;
  description?: string | ReactElement;
  variant?: string;
  isExpanded?: boolean;
  allowToggle?: boolean;
  copyText?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  }, [copied]);

  const collapsible = !isExpanded || allowToggle;
  const styles = useMemo(() => {
    switch (variant) {
      case "info":
        return { bg: "bg-[#95c1ea]", text: "text-[black]" };
      case "warning":
        return {
          bg: "bg-[#1f2320] border border-foreground-100",
          text: "text-[white] text-sm",
        };
      case "error":
        return {
          bg: "shadow-[inset_0_0_0_1px] shadow-destructive",
          text: "text-destructive",
        };
      default:
        return { bg: "bg-background-200", text: "text-foreground" };
    }
  }, [variant]);

  const noContents = !description;

  return (
    <Accordion
      type="single"
      collapsible={collapsible}
      defaultValue={isExpanded ? "item-1" : undefined}
      className={className}
      disabled={noContents}
    >
      <AccordionItem
        value="item-1"
        className={cn(
          "flex flex-col rounded gap-2 h-fit box-border",
          styles.bg,
          styles.text,
        )}
      >
        <AccordionTrigger
          hideIcon={!collapsible || noContents}
          color={"text-destructive-100"}
          tabIndex={collapsible ? undefined : -1}
          className={`px-3 pt-2.5 pb-2 items-start gap-2`}
          parentClassName={`${collapsible ? "" : "cursor-auto"}`}
          wedgeIconSize={"sm"}
          wedgeClassName="mr-2.5"
        >
          {variant && variant !== "default" && (
            <div className="w-5">
              <ErrorAlertIcon
                variant={variant as ErrorAlertIconProps["variant"]}
              />
            </div>
          )}
          <div className={cn("text-xs/[20px] font-semibold", styles.text)}>
            {title}
          </div>
        </AccordionTrigger>

        <AccordionContent className="relative px-3 pb-2.5">
          {copyText && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-0 w-8 h-8"
              onClick={() => {
                setCopied(true);
                navigator.clipboard.writeText(copyText);
              }}
            >
              {copied ? (
                <CheckIcon size="sm" className={cn(styles.text, "m-auto")} />
              ) : (
                <CopyIcon size="sm" className={cn(styles.text, "m-auto")} />
              )}
            </Button>
          )}
          {description && <div className="text-xs mr-7">{description}</div>}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function ControllerErrorAlert({
  error,
  isPaymaster = false,
  className,
}: {
  error: ControllerError | Error | ErrorWithGraphQL;
  isPaymaster?: boolean;
  className?: string;
}) {
  const advancedView = useAdvancedView();

  if (!advancedView) {
    const presentation = getSimpleErrorPresentation(error);
    return (
      <ErrorAlert
        title={presentation.title}
        description={presentation.description}
        variant={presentation.variant ?? "error"}
        isExpanded
        className={className}
      />
    );
  }

  let title = "An error occurred";
  let description: string | React.ReactElement = error.message;
  let isExpanded = false;
  let variant = "error";
  let copyText: string | undefined;

  if (!isControllerError(error)) {
    // Check if this error has parsed GraphQL error details attached
    if ("graphqlError" in error && error.graphqlError) {
      const graphqlError = error.graphqlError as GraphQLErrorDetails;

      // Use the summary (which contains the desc field) as the title
      title = graphqlError.summary;

      // Build description from the GraphQL errors
      if (graphqlError.errors && graphqlError.errors.length > 0) {
        if (graphqlError.errors.length === 1) {
          // Single error - show it cleanly
          const err = graphqlError.errors[0];
          const pathStr = err.path ? `Path: ${err.path.join(" → ")}` : "";
          description = pathStr;
        } else {
          // Multiple errors - show them as a list
          description = (
            <div className="flex flex-col gap-2 text-xs">
              {graphqlError.errors.map((err, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div>• {err.message}</div>
                  {err.path && (
                    <div className="ml-3 opacity-70">
                      Path: {err.path.join(" → ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }
      } else {
        description = "";
      }

      // rpcError contaisn the actual reason for failure
      const rpcError = graphqlError.details?.rpcError ?? "";
      if (rpcError.startsWith("InvalidArgument:")) {
        description = (
          <>
            {rpcError}
            {description ? (
              <>
                <br />
                {description}
              </>
            ) : null}
          </>
        );
      }

      copyText = graphqlError.raw;
      isExpanded = false; // Keep closed by default
    } else if (error.message.includes("rpc error:")) {
      // Fallback for unparsed RPC errors
      const rpcMatch = error.message.match(
        /rpc error: code = (\w+) desc = ([^:]+)/,
      );
      if (rpcMatch) {
        const [, , desc] = rpcMatch;
        title = desc.trim();
        description = "";
      } else {
        title = "Unknown error";
        description = error.message;
      }
    } else if (error.message.includes("GraphQL")) {
      // Fallback for unparsed GraphQL errors
      const parsed = parseGraphQLError(error.message);
      title = parsed.summary;
      description = parsed.details.rpcError
        ? parsed.details.rpcError.replace(/^\w+:\s*/, "") // Remove the code prefix like "Internal: "
        : error.message;
    } else if (error instanceof ExternalWalletError) {
      title = "External Wallet Error";
      description = error.message;
    } else {
      title = "Unknown error";
      description = error.message;
    }

    return (
      <ErrorAlert
        title={title}
        description={description}
        variant={variant}
        isExpanded={isExpanded}
        copyText={copyText}
        className={className}
      />
    );
  }

  switch (error.code) {
    case ErrorCode.SignError:
      title = "Signing Error";
      if (error.message.includes("Get assertion error")) {
        title = "Authentication Error";
        description =
          "The authentication request timed out or was cancelled. Please try again.";
        isExpanded = true;
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
        "Let's fund your Controller and deploy it so we can start executing transactions.";
      isExpanded = true;
      variant = "warning";
      break;
    case ErrorCode.InsufficientBalance:
      title = "Insufficient funds";
      description =
        "Your controller does not have enough funds to complete this transaction";
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
      title = "Device Registration Error";
      description = "Failed to register your device. Please try again.";
      isExpanded = true;
      break;
    case ErrorCode.DeviceGetAssertion:
      title = "Authentication Error";
      description =
        "The authentication request timed out or was cancelled. Please try again.";
      isExpanded = true;
      break;
    case ErrorCode.DeviceBadAssertion:
      title = "Authentication Error";
      description = "Invalid authentication response. Please try again.";
      isExpanded = true;
      break;
    case ErrorCode.DeviceChannel:
      title = "Communication Error";
      description = "Failed to communicate with your device. Please try again.";
      isExpanded = true;
      break;
    case ErrorCode.DeviceOrigin:
      title = "Security Error";
      description =
        "Invalid security origin. Please ensure you're using a secure connection.";
      isExpanded = true;
      break;
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
    case ErrorCode.AccountSigning:
    case ErrorCode.AccountProvider:
    case ErrorCode.AccountClassHashCalculation:
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
      } catch {
        title = "Execution error";
        description = JSON.stringify(error.data);
      }
      break;
    case ErrorCode.StarknetValidationFailure: {
      const parsedError = parseValidationError(error);
      title = parsedError.summary;
      copyText = parsedError.raw;
      description =
        typeof parsedError.details === "string" ? (
          parsedError.details
        ) : (
          <div className="flex flex-col gap-px">
            {Object.entries(parsedError.details).map(([key, value]) => (
              <div key={key}>
                <span className="opacity-50">{humanizeString(key)}</span>:{" "}
                {typeof value === "bigint" ? value.toString() : value}
              </div>
            ))}
          </div>
        );
      variant = "error";
      isExpanded = true;
      break;
    }
    default: {
      title = "Unknown Error";
      break;
    }
  }

  return (
    <ErrorAlert
      title={title}
      description={description}
      variant={variant}
      isExpanded={isExpanded}
      copyText={copyText}
      className={className}
    />
  );
}

type SimpleErrorPresentation = {
  title: string;
  description: string;
  variant?: string;
};

function getSimpleErrorPresentation(
  error: ControllerError | Error | ErrorWithGraphQL,
): SimpleErrorPresentation {
  if (!isControllerError(error)) {
    if (error instanceof ExternalWalletError) {
      if (isExplicitWalletRejection(error.message)) {
        return {
          title: "Request cancelled",
          description: "Nothing was changed.",
        };
      }

      return {
        title: "Wallet request failed",
        description:
          "Check your wallet and recent activity before trying again.",
      };
    }

    if ("graphqlError" in error && error.graphqlError) {
      return connectionProblem;
    }

    return unknownProblem;
  }

  switch (error.code) {
    case ErrorCode.SignError:
    case ErrorCode.DeviceCreateCredential:
    case ErrorCode.DeviceGetAssertion:
    case ErrorCode.DeviceBadAssertion:
    case ErrorCode.DeviceChannel:
      return {
        title: "Authentication failed",
        description:
          "The request timed out or was cancelled. Please try again.",
      };
    case ErrorCode.InsufficientBalance:
    case ErrorCode.StarknetInsufficientAccountBalance:
    case ErrorCode.StarknetInsufficientMaxFee:
    case ErrorCode.AccountFeeOutOfRange:
      return {
        title: "Not enough funds",
        description: "Add funds or choose a smaller amount, then try again.",
        variant: "warning",
      };
    case ErrorCode.StorageError:
      return {
        title: "Couldn't access saved Controller data",
        description: "Check browser storage permissions, then try again.",
      };
    case ErrorCode.ProviderRateLimited:
    case ErrorCode.ProviderArrayLengthMismatch:
    case ErrorCode.ProviderOther:
      return connectionProblem;
    case ErrorCode.AccountFactoryError:
    case ErrorCode.CartridgeControllerNotDeployed:
      return {
        title: "Controller setup failed",
        description: "Try setting up your Controller again.",
      };
    case ErrorCode.OriginError:
    case ErrorCode.DeviceOrigin:
      return {
        title: "Security check failed",
        description: "Return to the game and start the request again.",
      };
    case ErrorCode.PolicyChainIdMismatch:
      return {
        title: "Wrong network selected",
        description:
          "The request does not match the selected network. Return to the game and try again.",
        variant: "warning",
      };
    case ErrorCode.EncodingError:
    case ErrorCode.SerdeWasmBindgenError:
    case ErrorCode.CairoSerdeError:
    case ErrorCode.CairoShortStringToFeltError:
    case ErrorCode.PaymasterExecutionTimeNotReached:
    case ErrorCode.PaymasterExecutionTimePassed:
    case ErrorCode.PaymasterInvalidCaller:
    case ErrorCode.PaymasterRateLimitExceeded:
    case ErrorCode.PaymasterNotSupported:
    case ErrorCode.PaymasterHttp:
    case ErrorCode.PaymasterExcecution:
    case ErrorCode.PaymasterSerialization:
    case ErrorCode.AccountSigning:
    case ErrorCode.AccountProvider:
    case ErrorCode.AccountClassHashCalculation:
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
    case ErrorCode.StarknetCompilationFailed:
    case ErrorCode.StarknetContractClassSizeIsTooLarge:
    case ErrorCode.StarknetNonAccount:
    case ErrorCode.StarknetDuplicateTx:
    case ErrorCode.StarknetCompiledClassHashMismatch:
    case ErrorCode.StarknetUnsupportedTxVersion:
    case ErrorCode.StarknetUnsupportedContractClassVersion:
    case ErrorCode.StarknetNoTraceAvailable:
    case ErrorCode.StarknetUnexpectedError:
    case ErrorCode.StarknetTransactionExecutionError:
    case ErrorCode.StarknetValidationFailure:
      return transactionFailed;
    default:
      return unknownProblem;
  }
}

function isExplicitWalletRejection(message: string): boolean {
  return /USER_REFUSED_OP|user (?:rejected|denied)|request (?:cancelled|canceled)|rejected by user/i.test(
    message,
  );
}

const connectionProblem: SimpleErrorPresentation = {
  title: "Connection problem",
  description: "Check your connection and try again.",
};

const transactionFailed: SimpleErrorPresentation = {
  title: "Transaction failed",
  description:
    "Review the request and try again. If it keeps failing, contact support.",
};

const unknownProblem: SimpleErrorPresentation = {
  title: "Something went wrong",
  description: "Please try again. If it keeps failing, contact support.",
};

function StackTraceDisplay({
  stackTrace,
}: {
  stackTrace: ReturnType<typeof parseExecutionError>["stack"];
}) {
  const explorer = useExplorer();
  const getExplorerUrl = useCallback(
    (key: "address" | "class", value: string) => {
      switch (key) {
        case "address":
          return explorer.contract(value);
        case "class":
          return explorer.class(value);
      }
    },
    [explorer],
  );

  return (
    <div className="flex flex-col gap-2">
      {stackTrace.map((trace, i, arr) => (
        <React.Fragment key={i}>
          <div className="flex flex-col gap-1">
            {Object.entries(trace).map(
              ([key, value]) =>
                value && (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-20 flex-shrink-0 capitalize opacity-50">
                      {key}
                    </div>
                    {key === "address" || key === "class" ? (
                      <Link
                        to={getExplorerUrl(key, value as string)}
                        target="_blank"
                        className="break-all text-left hover:underline"
                      >
                        {formatAddress(value as string, {
                          size: "sm",
                        })}
                      </Link>
                    ) : key === "selector" ? (
                      <div className="break-all text-left">
                        {formatAddress(value as string, {
                          size: "sm",
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {(value as string[]).map((line, i) => (
                          <div key={i} className="break-all text-left">
                            {line}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ),
            )}
          </div>
          {i !== arr.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </div>
  );
}

export function isControllerError(
  error: ControllerError | Error,
): error is ControllerError {
  return !!(error as ControllerError).code;
}
