import dynamic from "next/dynamic";
import { Signature } from "starknet";
import { ResponseCodes } from "@cartridge/controller";
import { DeployController, ConfirmTransaction, SignMessage } from "components";
import { CreateController, CreateSession, Logout } from "components/connect";
import { useConnection } from "hooks/connection";
import { DeployCtx, SignMessageCtx } from "utils/connection";
import { LoginMode } from "components/connect/types";
import { ErrorPage } from "components/ErrorBoundary";
import { Settings } from "components/Settings";
import { Upgrade } from "components/connect/Upgrade";
import { PurchaseCredits } from "components/Funding/PurchaseCredits";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

function Home() {
  const { context, controller, error, policies, upgrade } = useConnection();
  const posthog = usePostHog();

  useEffect(() => {
    if (context?.origin) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: "always",
        enable_recording_console_log: true,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") posthog.debug();
        },
      });
    }
  }, [context?.origin, posthog]);

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

      // TODO: show missing policies if mismatch
      if (!context.policies?.length || controller.session(context.policies)) {
        context.resolve({
          code: ResponseCodes.SUCCESS,
          address: controller.address,
          policies,
        });
      }

      return (
        <CreateSession
          onConnect={(policies) => {
            context.resolve({
              code: ResponseCodes.SUCCESS,
              address: controller.address,
              policies,
            } as any);
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

export default dynamic(() => Promise.resolve(Home), { ssr: false });
