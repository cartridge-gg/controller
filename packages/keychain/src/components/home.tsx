import { Signature } from "starknet";
import { useEffect, useState } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import {
  DeployCtx,
  ExecuteCtx,
  OpenStarterPackCtx,
  SignMessageCtx,
} from "@/utils/connection";
import { ConfirmTransaction } from "./transaction/ConfirmTransaction";
import { CreateController, CreateSession, Upgrade } from "./connect";
import { LoginMode } from "./connect/types";
import { DeployController } from "./DeployController";
import { Purchase } from "./purchase";
import { Settings } from "./settings";
import { SignMessage } from "./SignMessage";
import { PageLoading } from "./Loading";
import { execute } from "@/utils/connection/execute";
import { useUpgrade } from "./provider/upgrade";
import { usePostHog } from "./provider/posthog";
import { StarterPack } from "./starterpack";
import { PurchaseType } from "@/hooks/payments/crypto";

export function Home() {
  const { context, setContext, controller, policies, origin } = useConnection();
  const upgrade = useUpgrade();
  const [hasSessionForPolicies, setHasSessionForPolicies] = useState<
    boolean | undefined
  >(undefined);
  const posthog = usePostHog();

  useEffect(() => {
    if (controller && policies) {
      controller.isRequestedSession(policies).then((isRequestedSession) => {
        setHasSessionForPolicies(isRequestedSession);
      });
    } else if (controller && !policies) {
      setHasSessionForPolicies(true);
    }
  }, [controller, policies]);

  useEffect(() => {
    if (context?.type) {
      posthog?.capture(
        `Call ${context.type.charAt(0).toUpperCase() + context.type.slice(1)}`,
      );
    }
  }, [context?.type, posthog]);

  if (window.self === window.top || !context || !origin) {
    return <></>;
  }

  // No controller, send to login
  if (!controller) {
    return <CreateController loginMode={LoginMode.Controller} />;
  }

  if (!upgrade.isSynced || hasSessionForPolicies === undefined) {
    // This is likely never observable in a real application but just in case.
    return <PageLoading />;
  }

  if (upgrade.available) {
    return <Upgrade />;
  }

  switch (context.type) {
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
          address: controller.address(),
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
      if (!hasSessionForPolicies) {
        return (
          <CreateSession
            isUpdate
            policies={policies!}
            onConnect={async () => {
              const res = await execute({
                setContext: (nextCtx) => {
                  setContext(nextCtx);
                },
              })(ctx.transactions, undefined, undefined, false);

              setHasSessionForPolicies(true);

              if ("transaction_hash" in res) {
                // resets execute ui
                setContext(undefined);
                return ctx.resolve?.({
                  code: ResponseCodes.SUCCESS,
                  transaction_hash: res.transaction_hash,
                });
              }
            }}
          />
        );
      }

      return <ConfirmTransaction />;
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
    case "open-settings": {
      return <Settings />;
    }
    case "open-purchase-credits": {
      return <Purchase type={PurchaseType.CREDITS} />;
    }
    case "open-starter-pack": {
      const ctx = context as OpenStarterPackCtx;
      return <StarterPack starterpackId={ctx.starterpackId} />;
    }
    default:
      return <>*Waves*</>;
  }
}
