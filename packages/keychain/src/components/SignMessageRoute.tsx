import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ResponseCodes } from "@cartridge/controller";
import { Signature } from "starknet";
import { useConnection } from "@/hooks/connection";
import { SignMessage } from "./SignMessage";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { parseSignMessageParams } from "@/utils/connection/sign";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

export function SignMessageRoute() {
  const { closeModal, setOnModalClose } = useConnection();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [params, setParams] = useState<
    ReturnType<typeof parseSignMessageParams>
  >(null);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      const parsed = parseSignMessageParams(dataParam);
      if (parsed) {
        setParams(parsed);
        return;
      }
    }

    navigate("/", { replace: true });
  }, [searchParams, navigate]);

  useEffect(() => {
    return () => {
      if (params?.params.id) {
        cleanupCallbacks(params.params.id);
      }
    };
  }, [params?.params.id]);

  const returnTo = searchParams.get("returnTo");

  const cancelWithoutClosing = useCallback(() => {
    if (!params) {
      return;
    }

    params.onCancel?.();
    params.resolve?.(CANCEL_RESPONSE);
    cleanupCallbacks(params.params.id);
  }, [params]);

  const handleCompletion = useCallback(() => {
    setOnModalClose?.(undefined);
    if (returnTo) {
      navigate(returnTo, { replace: true });
    } else {
      void closeModal?.();
    }
  }, [returnTo, navigate, closeModal, setOnModalClose]);

  const handleSign = useCallback(
    (signature: Signature) => {
      if (!params) {
        return;
      }

      params.resolve?.(signature);
      cleanupCallbacks(params.params.id);
      handleCompletion();
    },
    [params, handleCompletion],
  );

  const handleCancel = useCallback(() => {
    cancelWithoutClosing();
    handleCompletion();
  }, [cancelWithoutClosing, handleCompletion]);

  useEffect(() => {
    if (!setOnModalClose || !params?.resolve) {
      return;
    }

    setOnModalClose(() => {
      cancelWithoutClosing();
    });

    return () => {
      setOnModalClose(undefined);
    };
  }, [setOnModalClose, params?.resolve, cancelWithoutClosing]);

  if (!params) {
    return null;
  }

  return (
    <SignMessage
      typedData={params.params.typedData}
      onSign={handleSign}
      onCancel={handleCancel}
    />
  );
}
