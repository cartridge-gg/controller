import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { cleanupCallbacks, getCallbacks } from "@/utils/connection/callbacks";
import { useConnection } from "@/hooks/connection";
import { DeployController } from "./DeployController";
import { ResponseCodes, ConnectError } from "@cartridge/controller";
import { DeployParams } from "@/utils/connection/deploy";

function parseDeployParams(paramString: string): {
  params: DeployParams;
  resolve?: (res: void | ConnectError) => void;
  reject?: (reason?: unknown) => void;
} | null {
  try {
    const params: DeployParams = JSON.parse(decodeURIComponent(paramString));

    // Only get callbacks if there's an actual ID
    const callbacks = params.id ? getCallbacks(params.id) : {};

    return {
      params,
      ...callbacks,
    };
  } catch (error) {
    console.error("Failed to parse deploy params:", error);
    return null;
  }
}

export function DeployControllerRoute() {
  const { closeModal } = useConnection();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [params, setParams] =
    useState<ReturnType<typeof parseDeployParams>>(null);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      const parsed = parseDeployParams(dataParam);
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

  const handleClose = () => {
    if (params.resolve) {
      params.resolve({
        code: ResponseCodes.CANCELED,
        message: "Canceled",
      });
      closeModal?.();
    }
  };

  return <DeployController onClose={handleClose} />;
}

