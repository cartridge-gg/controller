import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { cleanupCallbacks, getCallbacks } from "@/utils/connection/callbacks";
import { useConnection } from "@/hooks/connection";
import { SignMessage } from "./SignMessage";
import { ResponseCodes, ConnectError } from "@cartridge/controller";
import { SignMessageParams } from "@/utils/connection/sign";
import { Signature } from "starknet";

function parseSignMessageParams(paramString: string): {
  params: SignMessageParams;
  resolve?: (res: Signature | ConnectError) => void;
  reject?: (reason?: unknown) => void;
} | null {
  try {
    const params: SignMessageParams = JSON.parse(
      decodeURIComponent(paramString),
    );

    // Only get callbacks if there's an actual ID
    const callbacks = params.id ? getCallbacks(params.id) : {};

    return {
      params,
      ...callbacks,
    };
  } catch (error) {
    console.error("Failed to parse sign message params:", error);
    return null;
  }
}

export function SignMessageRoute() {
  const { closeModal } = useConnection();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [params, setParams] =
    useState<ReturnType<typeof parseSignMessageParams>>(null);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      const parsed = parseSignMessageParams(dataParam);
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

  const handleSign = (signature: Signature) => {
    if (params.resolve) {
      params.resolve(signature);
      closeModal?.();
    }
  };

  const handleCancel = () => {
    if (params.resolve) {
      params.resolve({
        code: ResponseCodes.CANCELED,
        message: "Canceled",
      });
      closeModal?.();
    }
  };

  return (
    <SignMessage
      typedData={params.params.typedData}
      onSign={handleSign}
      onCancel={handleCancel}
    />
  );
}

