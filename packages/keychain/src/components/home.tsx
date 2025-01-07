import { Signature } from "starknet";
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { ResponseCodes } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { DeployCtx, SignMessageCtx } from "@/utils/connection";
import { ConfirmTransaction } from "./ConfirmTransaction";
import { CreateController, CreateSession, Logout, Upgrade } from "./connect";
import { LoginMode } from "./connect/types";
import { DeployController } from "./DeployController";
import { ErrorPage } from "./ErrorBoundary";
import { PurchaseCredits } from "./funding/PurchaseCredits";
import { Settings } from "./settings";
import { SignMessage } from "./SignMessage";
import { PageLoading } from "./Loading";

export function Home() {
  const { context, controller, error, policies, upgrade } = useConnection();
  const [hasSessionForPolicies, setHasSessionForPolicies] = useState<
    boolean | undefined
  >(undefined);
  const posthog = usePostHog();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !window.location.hostname.includes("localhost")
    ) {
      posthog.init(import.meta.env.VITE_POSTHOG_KEY!, {
        api_host: import.meta.env.VITE_POSTHOG_HOST,
        person_profiles: "always",
        enable_recording_console_log: true,
        loaded: (posthog) => {
          if (import.meta.env.DEV) posthog.debug();
        },
      });
    }
  }, [context?.origin, posthog]);

  useEffect(() => {
    if (controller && policies) {
      controller.isRequestedSession(policies).then((isRequestedSession) => {
        setHasSessionForPolicies(isRequestedSession);
      });
    } else {
      setHasSessionForPolicies(undefined);
    }
  }, [controller, policies]);

  if (window.self === window.top || !context?.origin) {
    return <></>;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  // No controller, send to login
  if (!controller) {
    return <CreateController loginMode={LoginMode.Controller} />;
  }

  if (!upgrade.isSynced) {
    return <></>;
  }

  if (upgrade.available) {
    return <Upgrade />;
  }

  switch (context.type) {
    case "connect": {
      posthog?.capture("Call Connect");

      // if no policies, we can connect immediately
      if (
        !policies ||
        ((!policies.contracts ||
          Object.keys(policies.contracts).length === 0) &&
          policies.messages?.length === 0)
      ) {
        context.resolve({
          code: ResponseCodes.SUCCESS,
          address: controller.address,
        });

        return <></>;
      }

      if (hasSessionForPolicies === undefined) {
        // This is likely never observable in a real application but just in case.
        return <PageLoading />;
      } else if (hasSessionForPolicies) {
        context.resolve({
          code: ResponseCodes.SUCCESS,
          address: controller.address,
          policies: policies,
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
              address: controller.address,
            });
          }}
        />
      );
    }
    case "logout": {
      posthog?.capture("Call Logout");

      return <Logout />;
    }
    case "sign-message": {
      posthog?.capture("Call Sign Message");

      const ctx = context as SignMessageCtx;
      return (
        <SignMessage
          origin={ctx.origin}
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
      posthog?.capture("Call Execute");

      return <ConfirmTransaction />;
    }
    case "deploy": {
      posthog?.capture("Call Deploy");

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
      posthog?.capture("Call Open Settings");

      return <Settings />;
    }
    case "open-purchase-credits": {
      posthog?.capture("Call Purchase Credits");

      return <PurchaseCredits />;
    }
    default:
      return <>*Waves*</>;
  }
}
