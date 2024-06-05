import dynamic from "next/dynamic";
import { Signature } from "starknet";
import { ResponseCodes, ExecuteReply } from "@cartridge/controller";
import {
  CreateController,
  CreateSession,
  DeploymentRequired,
  Execute,
  Logout,
  SignMessage,
} from "components";
import { useConnection } from "hooks/connection";
import {
  ConnectionCtx,
  ConnectCtx,
  ExecuteCtx,
  LogoutCtx,
  SignMessageCtx,
} from "utils/connection";
import { diff } from "utils/controller";
import { logout } from "utils/connection/logout";

function Home() {
  const { context, controller, chainId, setContext, error } = useConnection();

  if (window.self === window.top) {
    return <></>;
  }

  if (!context?.origin) {
    return <></>;
  }

  if (error) {
    return <>{error.message}</>;
  }

  // No controller, send to login
  if (!controller) {
    return <CreateController />;
  }

  const onLogout = (context: ConnectionCtx) => {
    setContext({
      origin: context.origin,
      type: "logout",
      resolve: context.resolve,
      reject: context.reject,
    } as LogoutCtx);
  };

  switch (context.type) {
    case "connect": {
      const ctx = context as ConnectCtx;
      const session = controller.session(context.origin);

      // if no mismatch with existing policies then return success
      if (session && diff(session.policies, ctx.policies).length === 0) {
        ctx.resolve({
          code: ResponseCodes.SUCCESS,
          address: controller.address,
          policies: ctx.policies,
        });
        return <></>;
      }

      return (
        <CreateSession
          chainId={chainId}
          origin={ctx.origin}
          policies={ctx.type === "connect" ? (ctx as ConnectCtx).policies : []}
          onConnect={(policies) => {
            context.resolve({
              code: ResponseCodes.SUCCESS,
              address: controller.address,
              policies,
            } as any);
          }}
          onCancel={() =>
            ctx.resolve({ code: ResponseCodes.CANCELED, message: "Canceled" })
          }
          onLogout={() => onLogout(ctx)}
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
          chainId={chainId}
          controller={controller}
          origin={ctx.origin}
          typedData={ctx.typedData}
          onSign={(sig: Signature) => context.resolve(sig)}
          onCancel={() =>
            ctx.resolve({
              code: ResponseCodes.CANCELED,
              message: "Canceled",
            })
          }
          onLogout={() => onLogout(ctx)}
        />
      );
    }
    case "execute": {
      const ctx = context as ExecuteCtx;

      return (
        <DeploymentRequired
          chainId={chainId}
          controller={controller}
          onClose={() =>
            ctx.resolve({
              code: ResponseCodes.CANCELED,
              message: "Canceled",
            })
          }
          onLogout={() => onLogout(ctx)}
        >
          <Execute
            {...ctx}
            chainId={chainId}
            controller={controller}
            onExecute={(res: ExecuteReply) => ctx.resolve(res)}
            onCancel={() =>
              ctx.resolve({
                code: ResponseCodes.CANCELED,
                message: "Canceled",
              })
            }
            onLogout={() => onLogout(ctx)}
          />
        </DeploymentRequired>
      );
    }
    default:
      return <>*Waves*</>;
  }
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
