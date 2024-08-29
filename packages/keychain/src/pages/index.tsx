import dynamic from "next/dynamic";
import { Signature } from "starknet";
import { ResponseCodes } from "@cartridge/controller";
import { DeploymentRequired, Execute, Menu, SignMessage } from "components";
import { CreateController, CreateSession, Logout } from "components/connect";
import { useConnection } from "hooks/connection";
import {
  DeployCtx,
  LogoutCtx,
  OpenMenuCtx,
  OpenSettingsCtx,
  SetDelegateCtx,
  SignMessageCtx,
} from "utils/connection";
import { logout } from "utils/connection/logout";
import { LoginMode } from "components/connect/types";
import { ErrorPage } from "components/ErrorBoundary";
import { SetDelegate } from "components/SetDelegate";
import { SetExternalOwner } from "components/SetExternalOwner";
import { Settings } from "components/Settings";

function Home() {
  const { context, controller, error, setDelegateTransaction, policies } =
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

  console.debug({ context_type: context.type });

  switch (context.type) {
    case "connect": {
      // TODO: show missing policies if mismatch
      if (!context.policies?.length || controller.account.sessionJson()) {
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
            logout(ctx.origin)();
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
      return (
        <Execute />
      );
    }
    case "deploy": {
      const ctx = context as DeployCtx;
      return (
        <DeploymentRequired
          onClose={() =>
            ctx.resolve({
              code: ResponseCodes.CANCELED,
              message: "Canceled",
            })}
        />
      );
    }
    case "open-menu": {
      const ctx = context as OpenMenuCtx;
      return (
          <Menu
            onLogout={() => {
              logout(ctx.origin)();

              ctx.resolve({
                code: ResponseCodes.NOT_CONNECTED,
                message: "User logged out",
              });
            }}
          />
      );
    }

    case "open-settings": {
      const ctx = context as OpenSettingsCtx;
      return (
          <Settings
            onLogout={() => {
              logout(ctx.origin)();

              ctx.resolve({
                code: ResponseCodes.NOT_CONNECTED,
                message: "User logged out",
              });
            }}
          />
      );
    }

    case "set-delegate": {
      const ctx = context as SetDelegateCtx;
      return (
          <SetDelegate
            onSetDelegate={(delegateAddress) => {
              setDelegateTransaction(ctx, delegateAddress);
            }}
          />
      );
    }
    case "set-external-owner": {
      return (
          <SetExternalOwner />
      );
    }
    default:
      return <>*Waves*</>;
  }
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
