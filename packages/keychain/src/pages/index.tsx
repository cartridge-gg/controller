import dynamic from "next/dynamic";
import { Signature } from "starknet";
import { ResponseCodes } from "@cartridge/controller";
import { DeployController, ConfirmTransaction, SignMessage } from "components";
import { CreateController, CreateSession, Logout } from "components/connect";
import { useConnection } from "hooks/connection";
import {
  DeployCtx,
  LogoutCtx,
  OpenSettingsCtx,
  SignMessageCtx,
} from "utils/connection";
import { LoginMode } from "components/connect/types";
import { ErrorPage } from "components/ErrorBoundary";
import { Settings } from "components/Settings";
import { Upgrade } from "components/connect/Upgrade";
import { PurchaseCredits } from "components/Funding/PurchaseCredits";

function Home() {
  const { context, controller, setController, error, policies, upgrade } =
    useConnection();

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
      const ctx = context as LogoutCtx;
      return (
        <Logout
          onConfirm={() => {
            window.controller?.disconnect();
            setController(undefined);

            ctx.resolve({
              code: ResponseCodes.NOT_CONNECTED,
              message: "User logged out",
            });
          }}
          onCancel={() =>
            ctx.resolve({
              code: ResponseCodes.CANCELED,
              message: "User cancelled logout",
            })
          }
        />
      );
    }
    case "sign-message": {
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
      const ctx = context as OpenSettingsCtx;
      return (
        <Settings
          onLogout={() => {
            window.controller?.disconnect();
            setController(undefined);

            ctx.resolve({
              code: ResponseCodes.NOT_CONNECTED,
              message: "User logged out",
            });
          }}
        />
      );
    }
    case "open-purchase-credits": {
      return <PurchaseCredits />;
    }
    default:
      return <>*Waves*</>;
  }
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
