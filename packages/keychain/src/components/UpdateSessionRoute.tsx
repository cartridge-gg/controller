import { useCallback, useEffect, useState } from "react";
import { ResponseCodes, getPresetSessionPolicies } from "@cartridge/controller";
import { loadConfig } from "@cartridge/presets";
import { useConnection } from "@/hooks/connection";
import {
  parseSessionPolicies,
  type ParsedSessionPolicies,
} from "@/hooks/session";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { parseUpdateSessionParams } from "@/utils/connection/update-session";
import { CreateSession } from "./connect/CreateSession";
import {
  createVerifiedSession,
  requiresSessionApproval,
} from "@/utils/connection/session-creation";
import {
  useRouteParams,
  useRouteCompletion,
  useRouteCallbacks,
} from "@/hooks/route";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  SpinnerIcon,
} from "@cartridge/ui";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

export function UpdateSessionRoute() {
  const { controller, origin, theme, chainId, verified } = useConnection();
  const [resolvedPolicies, setResolvedPolicies] =
    useState<ParsedSessionPolicies>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionCreating, setIsSessionCreating] = useState(false);
  const [sessionError, setSessionError] = useState<Error>();

  const params = useRouteParams((searchParams: URLSearchParams) => {
    return parseUpdateSessionParams(searchParams);
  });

  const handleCompletion = useRouteCompletion();

  useRouteCallbacks(params, CANCEL_RESPONSE);

  // Resolve policies from params (either direct policies or from preset)
  useEffect(() => {
    if (!params) return;

    const { policies, preset } = params.params;

    if (policies) {
      // Direct policies provided - parse them
      const parsed = parseSessionPolicies({
        policies,
        verified,
      });
      setResolvedPolicies(parsed);
      return;
    }

    if (preset && chainId) {
      // Resolve policies from preset
      setIsLoading(true);
      loadConfig(preset)
        .then((config) => {
          if (!config) {
            console.error(`Failed to load preset: ${preset}`);
            return;
          }

          const sessionPolicies = getPresetSessionPolicies(
            config as Record<string, unknown>,
            chainId,
          );
          if (!sessionPolicies) {
            console.error(
              `No policies found for chain ${chainId} in preset ${preset}`,
            );
            return;
          }

          const parsed = parseSessionPolicies({
            policies: sessionPolicies,
            verified,
          });
          setResolvedPolicies(parsed);
        })
        .catch((error) => {
          console.error("Failed to resolve preset policies:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [params, chainId, verified]);

  const handleConnect = useCallback(async () => {
    if (!params || !controller) {
      return;
    }

    params.resolve?.({
      code: ResponseCodes.SUCCESS,
      address: controller.address(),
    });
    if (params.params.id) {
      cleanupCallbacks(params.params.id);
    }
    handleCompletion();
  }, [params, controller, handleCompletion]);

  // Auto-create session for verified policies that don't require approval
  useEffect(() => {
    if (!resolvedPolicies || !controller || !params) return;

    if (!requiresSessionApproval(resolvedPolicies)) {
      const autoCreate = async () => {
        try {
          setIsSessionCreating(true);
          await createVerifiedSession({
            controller,
            origin,
            policies: resolvedPolicies,
          });
          params.resolve?.({
            code: ResponseCodes.SUCCESS,
            address: controller.address(),
          });
          if (params.params.id) {
            cleanupCallbacks(params.params.id);
          }
          handleCompletion();
        } catch (e) {
          console.error("Failed to auto-create session:", e);
          setSessionError(e instanceof Error ? e : new Error(String(e)));
        } finally {
          setIsSessionCreating(false);
        }
      };

      void autoCreate();
    }
  }, [resolvedPolicies, controller, params, origin, handleCompletion]);

  // Loading state
  if (!controller || isLoading) {
    return (
      <>
        <HeaderInner
          className="pb-0"
          title={theme ? theme.name : "Update Session"}
        />
        <LayoutContent className="flex items-center justify-center">
          <SpinnerIcon className="animate-spin" />
        </LayoutContent>
      </>
    );
  }

  if (!resolvedPolicies) {
    return null;
  }

  // Verified policies auto-creating
  if (resolvedPolicies.verified && !requiresSessionApproval(resolvedPolicies)) {
    if (sessionError) {
      return (
        <>
          <HeaderInner
            className="pb-0"
            title={theme ? theme.name : "Update Session"}
          />
          <LayoutContent />
          <LayoutFooter>
            <ControllerErrorAlert className="mb-3" error={sessionError} />
            <Button
              className="w-full"
              disabled={isSessionCreating}
              isLoading={isSessionCreating}
              onClick={async () => {
                if (!controller) return;
                setIsSessionCreating(true);
                setSessionError(undefined);
                try {
                  await createVerifiedSession({
                    controller,
                    origin,
                    policies: resolvedPolicies,
                  });
                  params?.resolve?.({
                    code: ResponseCodes.SUCCESS,
                    address: controller.address(),
                  });
                  if (params?.params.id) {
                    cleanupCallbacks(params.params.id);
                  }
                  handleCompletion();
                } catch (e) {
                  setSessionError(
                    e instanceof Error ? e : new Error(String(e)),
                  );
                } finally {
                  setIsSessionCreating(false);
                }
              }}
            >
              retry
            </Button>
          </LayoutFooter>
        </>
      );
    }
    return null;
  }

  // Show CreateSession for policies that require approval
  return (
    <CreateSession
      policies={resolvedPolicies}
      onConnect={handleConnect}
      isUpdate
    />
  );
}
