import { useEffect } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { CreateController, CreateSession, Upgrade } from "./connect";
import { PageLoading } from "./Loading";
import { useUpgrade } from "./provider/upgrade";
import { usePostHog } from "./provider/posthog";
import { Layout } from "@/components/layout";
import { Outlet, useLocation } from "react-router-dom";
import { Authenticate } from "./authenticate";
import { useNavigation } from "@/context/navigation";

export function Home() {
  const { context, controller, policies, isConfigLoading } = useConnection();
  const { pathname } = useLocation();
  const { navigate } = useNavigation();

  const upgrade = useUpgrade();
  const posthog = usePostHog();

  useEffect(() => {
    if (context?.type) {
      posthog?.capture(
        `Call ${context.type.charAt(0).toUpperCase() + context.type.slice(1)}`,
      );
    }
  }, [context?.type, posthog]);

  // Navigate to routes for deploy and sign-message context types
  useEffect(() => {
    if (context?.type === "deploy" && pathname !== "/deploy") {
      navigate("/deploy", { replace: true });
    } else if (
      context?.type === "sign-message" &&
      pathname !== "/sign-message"
    ) {
      navigate("/sign-message", { replace: true });
    }
  }, [context?.type, pathname, navigate]);

  // Popup flow authentication
  if (pathname.startsWith("/authenticate")) {
    return <Authenticate />;
  }

  // No controller, send to login
  if (!controller) {
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

          default:
            return <Outlet />;
        }
      })()}
    </Layout>
  );
}
