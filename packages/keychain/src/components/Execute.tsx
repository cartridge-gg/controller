import { useConnection } from "@/hooks/connection";
import { getCallbacks } from "@/utils/connection/callbacks";
import { ExecuteParams } from "@/utils/connection/execute";
import { ResponseCodes } from "@cartridge/controller";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ConfirmTransaction } from "./transaction/ConfirmTransaction";
import { useRouteParams, useRouteCompletion } from "@/hooks/route";
import { useNavigation } from "@/context";

function parseExecuteParams(searchParams: URLSearchParams): {
  params: ExecuteParams;
  resolve?: (result: unknown) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
} | null {
  try {
    const id = searchParams.get("id");
    const transactionsParam = searchParams.get("transactions");
    const errorParam = searchParams.get("error");

    if (!id || !transactionsParam) {
      console.error("Missing required parameters");
      return null;
    }

    const transactions = JSON.parse(decodeURIComponent(transactionsParam));
    const error = errorParam
      ? JSON.parse(decodeURIComponent(errorParam))
      : undefined;

    const params: ExecuteParams = {
      id,
      transactions,
      error,
    };

    // Only get callbacks if there's an actual ID
    const callbacks = getCallbacks(id) || {};

    return {
      params,
      ...callbacks,
    };
  } catch (error) {
    console.error("Failed to parse execute params:", error);
    return null;
  }
}

export function Execute() {
  const { closeModal, setOnModalClose } = useConnection();
  const [searchParams] = useSearchParams();
  const params = useRouteParams(parseExecuteParams);
  const handleCompletion = useRouteCompletion();
  const { navigateToRoot } = useNavigation();

  // Execute has different cancel behavior - it resolves with ERROR instead of CANCELED
  useEffect(() => {
    if (!setOnModalClose || !params?.reject) {
      return;
    }
    setOnModalClose(() => {
      params.resolve!({
        code: ResponseCodes.ERROR,
        message: "User canceled",
        error: {
          message: "User canceled",
          code: 0,
        },
      });

      navigateToRoot();
    });
  }, [params?.reject, params?.resolve, setOnModalClose, navigateToRoot]);

  if (!params) {
    return null;
  }

  return (
    <ConfirmTransaction
      transactions={params.params.transactions}
      executionError={params.params.error}
      onComplete={(transaction_hash) => {
        // Check if there's a returnTo URL parameter and navigate there
        const returnTo = searchParams.get("returnTo");
        if (returnTo) {
          handleCompletion();
        } else if (params.resolve) {
          params.resolve({
            code: ResponseCodes.SUCCESS,
            transaction_hash,
          });

          closeModal?.();
        }
      }}
      onError={(error) => {
        if (params.resolve) {
          params.resolve({
            code: ResponseCodes.ERROR,
            message: error.message,
            error,
          });
        }
        // For manual navigation, just stay on the page or show error
      }}
    />
  );
}
