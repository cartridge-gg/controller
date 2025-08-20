import { Signature, constants } from "starknet";
import { useCallback, useEffect } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { DeployCtx, SignMessageCtx } from "@/utils/connection";
import { CreateController, CreateSession, Upgrade } from "./connect";
import { DeployController } from "./DeployController";
import { SignMessage } from "./SignMessage";
import { PageLoading } from "./Loading";
import { useUpgrade } from "./provider/upgrade";
import { usePostHog } from "./provider/posthog";
import { Layout } from "@/components/layout";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { Authenticate } from "./authenticate";
import { Button } from "@cartridge/ui";

export function Home() {
  const [searchParams] = useSearchParams();

  if (searchParams.get("callback_uri")) {
    return <MockedHome />;
  }

  return <HomeInner />;
}

function MockedHome() {
  const [searchParams] = useSearchParams();

  const onClick = useCallback(() => {
    const callbackUrl = decodeURIComponent(searchParams.get("callback_uri")!);
    if (!callbackUrl) {
      throw new Error("callback_uri is required");
    }
    const url = new URL(callbackUrl);
    url.searchParams.set("address", "0x0000000000000000000000000000000000000000000000000000000000000000");
    url.searchParams.set("chain_id", constants.StarknetChainId.SN_MAIN);
    url.searchParams.set("rpc_url", encodeURIComponent("https://api.cartridge.gg/x/starknet/mainnet"));
    window.location.href = url.toString();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button onClick={onClick}>Log in</Button>
    </div>
  );
}

export function HomeInner() {
  const { context, controller, policies, isConfigLoading } = useConnection();
  const { pathname } = useLocation();

  const upgrade = useUpgrade();
  const posthog = usePostHog();

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
