import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useConnection } from "@/hooks/connection";
import { cleanupCallbacks } from "@/utils/connection/callbacks";

/**
 * Common hook for parsing route params from URL and managing callbacks
 * @param parseParams - Function to parse the URLSearchParams
 * @returns Parsed params with callbacks, or null if parsing failed
 */
export function useRouteParams<T extends { id?: string }>(
  parseParams: (searchParams: URLSearchParams) => {
    params: T;
    resolve?: (result: unknown) => void;
    reject?: (reason?: unknown) => void;
    onCancel?: () => void;
  } | null,
) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [params, setParams] = useState<ReturnType<typeof parseParams>>(null);

  // Parse URL params on mount or when searchParams change
  // Note: parseParams is intentionally not in the dependency array to avoid infinite loops
  // when inline functions are passed. The function should be stable or memoized by the caller.
  useEffect(() => {
    const parsed = parseParams(searchParams);
    if (parsed) {
      setParams(parsed);
    } else {
      // No valid data, redirect to home
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]);

  // Cleanup callbacks on unmount
  useEffect(() => {
    return () => {
      if (params?.params.id) {
        cleanupCallbacks(params.params.id);
      }
    };
  }, [params?.params.id]);

  return params;
}

/**
 * Hook for handling route completion (returnTo navigation or modal close)
 */
export function useRouteCompletion() {
  const { closeModal } = useConnection();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const handleCompletion = useCallback(() => {
    if (returnTo) {
      navigate(returnTo, { replace: true });
    } else {
      closeModal?.();
    }
  }, [returnTo, navigate, closeModal]);

  return handleCompletion;
}

/**
 * Hook for managing cancel callbacks and modal close handlers
 * @param params - Route params with resolve/reject callbacks
 * @param cancelResponse - Response to send when cancelled
 */
export function useRouteCallbacks<T extends { id?: string }>(
  params: {
    params: T;
    resolve?: (result: unknown) => void;
    reject?: (reason?: unknown) => void;
    onCancel?: () => void;
  } | null,
  cancelResponse: unknown,
) {
  const { setOnModalClose } = useConnection();

  const cancelWithoutClosing = useCallback(() => {
    if (!params || !params.params.id) {
      return;
    }

    params.onCancel?.();
    params.resolve?.(cancelResponse);
    cleanupCallbacks(params.params.id);
  }, [params, cancelResponse]);

  // Setup modal close handler
  useEffect(() => {
    if (!setOnModalClose || !params?.resolve) {
      return;
    }

    setOnModalClose(() => {
      cancelWithoutClosing();
    });

    return () => {
      setOnModalClose(() => {});
    };
  }, [setOnModalClose, params?.resolve, cancelWithoutClosing]);

  return { cancelWithoutClosing };
}
