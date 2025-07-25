import { Signature } from "starknet";
import { useEffect } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { DeployCtx, ExecuteCtx, SignMessageCtx } from "@/utils/connection";
import { ConfirmTransaction } from "./transaction/ConfirmTransaction";
import { CreateController, CreateSession, Upgrade } from "./connect";
import { DeployController } from "./DeployController";
import { SignMessage } from "./SignMessage";
import { PageLoading } from "./Loading";
import { useUpgrade } from "./provider/upgrade";
import { usePostHog } from "./provider/posthog";
import { Layout } from "@/components/layout";
import { Outlet } from "react-router-dom";

export function Home() {
  const { context, controller, policies, isConfigLoading } = useConnection();

  const upgrade = useUpgrade();
  const posthog = usePostHog();

  useEffect(() => {
    if (context?.type) {
      posthog?.capture(
        `Call ${context.type.charAt(0).toUpperCase() + context.type.slice(1)}`,
      );
    }
  }, [context?.type, posthog]);

  // No controller, send to login
  if (!controller) {
    return <CreateController />;
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

          case "execute": {
            const ctx = context as ExecuteCtx;
            return (
              <ConfirmTransaction
                onComplete={(transaction_hash) =>
                  ctx.resolve?.({
                    code: ResponseCodes.SUCCESS,
                    transaction_hash,
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
