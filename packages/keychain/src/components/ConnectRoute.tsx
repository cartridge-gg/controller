import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ResponseCodes, toSessionPolicies } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { parseConnectParams } from "@/utils/connection/connect";
import { CreateSession, processPolicies } from "./connect/CreateSession";
import { now } from "@/constants";
import { parseSessionPolicies } from "@/hooks/session";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

export function ConnectRoute() {
  const {
    controller,
    closeModal,
    setOnModalClose,
    setRpcUrl,
    setConfigSignupOptions,
    policies: contextPolicies,
  } = useConnection();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [params, setParams] =
    useState<ReturnType<typeof parseConnectParams>>(null);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      const parsed = parseConnectParams(dataParam);
      if (parsed) {
        setParams(parsed);
        // Set the RPC URL and signup options from params
        setRpcUrl(parsed.params.rpcUrl);
        if (parsed.params.signupOptions) {
          setConfigSignupOptions(parsed.params.signupOptions);
        }
        return;
      }
    }

    navigate("/", { replace: true });
  }, [searchParams, navigate, setRpcUrl, setConfigSignupOptions]);

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
    if (returnTo) {
      navigate(returnTo, { replace: true });
    } else {
      void closeModal?.();
    }
  }, [returnTo, navigate, closeModal]);

  const handleConnect = useCallback(() => {
    if (!params || !controller) {
      return;
    }

    params.resolve?.({
      code: ResponseCodes.SUCCESS,
      address: controller.address(),
    });
    cleanupCallbacks(params.params.id);
    handleCompletion();
  }, [params, controller, handleCompletion]);

  const handleSkip = useCallback(() => {
    if (!params || !controller) {
      return;
    }

    params.resolve?.({
      code: ResponseCodes.SUCCESS,
      address: controller.address(),
    });
    cleanupCallbacks(params.params.id);
    handleCompletion();
  }, [params, controller, handleCompletion]);

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

  const policies = useMemo(() => {
    if (!params?.params.policies) {
      return undefined;
    }

    // Always prefer context policies from preset configuration when available
    // Preset policies take precedence over manually provided policies
    if (contextPolicies) {
      return contextPolicies;
    }

    // Fall back to URL policies if no preset is configured
    // Parse policies from URL params - convert Policies to ParsedSessionPolicies
    // Policies can be either Policy[] or SessionPolicies, so use toSessionPolicies
    const sessionPolicies = toSessionPolicies(params.params.policies);

    const parsed = parseSessionPolicies({
      verified: false, // URL policies are not verified by default
      policies: sessionPolicies,
    });
    return parsed;
  }, [params, contextPolicies]);

  // Handle cases where we can connect immediately
  useEffect(() => {
    if (!params || !controller || !policies) {
      return;
    }

    // if no policies, we can connect immediately
    if (
      !policies ||
      ((!policies.contracts || Object.keys(policies.contracts).length === 0) &&
        policies.messages?.length === 0)
    ) {
      params.resolve?.({
        code: ResponseCodes.SUCCESS,
        address: controller.address(),
      });
      cleanupCallbacks(params.params.id);
      handleCompletion();
      return;
    }

    // Bypass session approval screen for verified sessions
    if (policies?.verified) {
      const createSessionForVerifiedPolicies = async () => {
        try {
          // Use a default duration for verified sessions (24 hours)
          const duration = BigInt(24 * 60 * 60); // 24 hours in seconds
          const expiresAt = duration + now();

          const processedPolicies = processPolicies(policies, false);
          await controller.createSession(expiresAt, processedPolicies);
          params.resolve?.({
            code: ResponseCodes.SUCCESS,
            address: controller.address(),
          });
          cleanupCallbacks(params.params.id);
          handleCompletion();
        } catch (e) {
          console.error("Failed to create verified session:", e);
          // Fall back to showing the UI if auto-creation fails
          params.reject?.(e);
        }
      };

      void createSessionForVerifiedPolicies();
    }
  }, [params, controller, policies, handleCompletion]);

  if (!policies || !controller) {
    return null;
  }

  // Don't show UI for no-policy or verified-policy connections
  if (
    (!policies.contracts || Object.keys(policies.contracts).length === 0) &&
    policies.messages?.length === 0
  ) {
    return null;
  }

  if (policies.verified) {
    return null;
  }

  return (
    <CreateSession
      policies={policies}
      onConnect={handleConnect}
      onSkip={handleSkip}
    />
  );
}
