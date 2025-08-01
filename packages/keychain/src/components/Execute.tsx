import { ConfirmTransaction } from "./transaction/ConfirmTransaction";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { cleanupCallbacks, getCallbacks } from "@/utils/connection/callbacks";
import { useConnection } from "@/hooks/connection";
import { ExecuteParams } from "@/utils/connection/execute";
import { ConnectError, ResponseCodes } from "@cartridge/controller";
import { InvokeFunctionResponse } from "starknet";

function parseExecuteParams(paramString: string): {
  params: ExecuteParams;
  resolve?: (res: InvokeFunctionResponse | ConnectError) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
} | null {
  try {
    const params: ExecuteParams = JSON.parse(decodeURIComponent(paramString));

    // Only get callbacks if there's an actual ID
    const callbacks = params.id ? getCallbacks(params.id) : {};

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
  const { closeModal } = useConnection();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [params, setParams] =
    useState<ReturnType<typeof parseExecuteParams>>(null);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      const parsed = parseExecuteParams(dataParam);
      if (parsed) {
        setParams(parsed);
        return;
      }
    }

    // No valid data, redirect to home
    navigate("/", { replace: true });
  }, [searchParams, navigate]);

  // Cleanup callbacks when component unmounts
  useEffect(() => {
    return () => {
      if (params?.params.id) {
        cleanupCallbacks(params.params.id);
      }
    };
  }, [params?.params.id]);

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
          navigate(returnTo, { replace: true });
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
      onClose={() => {
        if (params.resolve) {
          params.resolve({
            code: ResponseCodes.CANCELED,
            message: "User canceled",
          });

          closeModal?.();
        }
      }}
    />
  );
}
