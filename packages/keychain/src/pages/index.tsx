import dynamic from "next/dynamic";
import { Signature } from "starknet";
import { ResponseCodes } from "@cartridge/controller";
import { DeploymentRequired, Execute, Menu, SignMessage } from "components";
import { CreateController, CreateSession, Logout } from "components/connect";
import { useConnection } from "hooks/connection";
import {
  ExecuteCtx,
  LogoutCtx,
  OpenMenuCtx,
  SetDelegateCtx,
  SignMessageCtx,
} from "utils/connection";
import { logout } from "utils/connection/logout";
import { LoginMode } from "components/connect/types";
import { ErrorPage } from "components/ErrorBoundary";
import { SetDelegate } from "components/SetDelegate";

function Home() {
  const { context, controller, error, setDelegate, setDelegateTransaction } =
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

  switch (context.type) {
    case "connect": {
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
      const ctx = context as ExecuteCtx;
      return (
        <DeploymentRequired
          onClose={() =>
            ctx.resolve({
              code: ResponseCodes.CANCELED,
              message: "Canceled",
            })
          }
        >
          <Execute />
        </DeploymentRequired>
      );
    }
    case "open-menu": {
      const ctx = context as OpenMenuCtx;
      return (
        <DeploymentRequired
          onClose={() =>
            ctx.resolve({
              code: ResponseCodes.CANCELED,
              message: "Canceled",
            })
          }
        >
          <Menu
            onLogout={() => {
              logout(ctx.origin)();

              ctx.resolve({
                code: ResponseCodes.NOT_CONNECTED,
                message: "User logged out",
              });
            }}
            onSetDelegate={() => setDelegate(ctx)}
          />
        </DeploymentRequired>
      );
    }

    case "set-delegate": {
      const ctx = context as SetDelegateCtx;
      return (
        <DeploymentRequired
          onClose={() =>
            ctx.resolve({
              code: ResponseCodes.CANCELED,
              message: "Canceled",
            })
          }
        >
          <SetDelegate
            onClose={() =>
              ctx.resolve({
                code: ResponseCodes.CANCELED,
                message: "Canceled",
              })
            }
            onSetDelegate={(delegateAddress) => {
              setDelegateTransaction(ctx, delegateAddress);
            }}
            defaultAddress={ctx.account}
          />
        </DeploymentRequired>
      );
    }
    default:
      return <>*Waves*</>;
  }
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
