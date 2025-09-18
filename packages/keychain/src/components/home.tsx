import { Signature } from "starknet";
import { useEffect, useCallback } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { ConnectCtx, DeployCtx, SignMessageCtx } from "@/utils/connection";
import { CreateController, CreateSession, Upgrade } from "./connect";
import { HeadlessConnect } from "./connect/HeadlessConnect";
import { DeployController } from "./DeployController";
import { SignMessage } from "./SignMessage";
import { PageLoading } from "./Loading";
import { useUpgrade } from "./provider/upgrade";
import { usePostHog } from "./provider/posthog";
import { Layout } from "@/components/layout";
import { Outlet, useLocation } from "react-router-dom";
import { Authenticate } from "./authenticate";
import { now } from "@/constants";
import { useConnection } from "@/hooks/connection";

export function Home() {
  const { context, controller, policies, isConfigLoading } = useConnection();
  const { pathname } = useLocation();

  const upgrade = useUpgrade();
  const posthog = usePostHog();

  const createSessionForVerifiedPolicies = useCallback(async () => {
    if (!controller || !policies) return;

    try {
      // Use a default duration for verified sessions (24 hours)
      const duration = BigInt(24 * 60 * 60); // 24 hours in seconds
      const expiresAt = duration + now();

      await controller.createSession(expiresAt, policies);
      (context as ConnectCtx).resolve({
        code: ResponseCodes.SUCCESS,
        address: controller.address(),
      });
    } catch (e) {
      console.error("Failed to create verified session:", e);
      // Fall back to showing the UI if auto-creation fails
      context?.reject?.(e);
    }
  }, [controller, policies, context]);

  useEffect(() => {
    if (context?.type) {
      posthog?.capture(
        `Call ${context.type.charAt(0).toUpperCase() + context.type.slice(1)}`,
      );
    }
  }, [context?.type, posthog]);

  // Popup flow authentication
  if (pathname.startsWith("/authenticate")) {
    return <Authenticate />;
  }

  // No controller, check if headless or send to login
  if (!controller) {
    // Handle headless connection when no controller exists
    if (context?.type === "connect" && (context as ConnectCtx).headless) {
      return (
        <HeadlessConnect
          context={
            context as ConnectCtx & {
              headless: { username: string; authMethod: string };
            }
          }
        />
      );
    }
    return <CreateController isSlot={pathname.startsWith("/slot")} />;
  }

  if (!upgrade.isSynced || isConfigLoading) {
    // This is likely never observable in a real application but just in case.
    return <PageLoading />;
  }

  if (upgrade.available) {
    return <Upgrade />;
  }

  return (
    <Layout>
      {(() => {
        switch (context?.type) {
          case "connect": {
            const connectCtx = context as ConnectCtx;

            // Handle headless connection
            if (connectCtx.headless) {
              return (
                <HeadlessConnect
                  context={
                    connectCtx as ConnectCtx & {
                      headless: { username: string; authMethod: string };
                    }
                  }
                />
              );
            }

            // if no policies, we can connect immediately
            if (
              !policies ||
              ((!policies.contracts ||
                Object.keys(policies.contracts).length === 0) &&
                policies.messages?.length === 0)
            ) {
              context.resolve({
                code: ResponseCodes.SUCCESS,
                address: controller!.address(),
              });

              return <></>;
            }

            // Bypass session approval screen for verified sessions
            if (policies?.verified) {
              createSessionForVerifiedPolicies();
              return <></>;
            }

            // TODO: show missing policies if mismatch
            return (
              <CreateSession
                policies={policies!}
                onConnect={() => {
                  context.resolve({
                    code: ResponseCodes.SUCCESS,
                    address: controller.address(),
                  });
                }}
                onSkip={() => {
                  context.resolve({
                    code: ResponseCodes.SUCCESS,
                    address: controller.address(),
                  });
                }}
              />
            );
          }

          case "sign-message": {
            const ctx = context as SignMessageCtx;
            return (
              <SignMessage
                typedData={ctx.typedData}
                onSign={(sig: Signature) => context.resolve(sig)}
                onCancel={() =>
                  ctx.resolve({
                    code: ResponseCodes.CANCELED,
                    message: "Canceled",
                  })
                }
              />
            );
          }

          case "deploy": {
            const ctx = context as DeployCtx;
            return (
              <DeployController
                onClose={() =>
                  ctx.resolve({
                    code: ResponseCodes.CANCELED,
                    message: "Canceled",
                  })
                }
              />
            );
          }
          default:
            return <Outlet />;
        }
      })()}
    </Layout>
  );
}
