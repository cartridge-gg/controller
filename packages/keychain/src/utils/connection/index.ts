export * from "./types";

import Controller from "@/utils/controller";
import { AuthOptions, StarterPack } from "@cartridge/controller";
import { connectToParent } from "@cartridge/penpal";
import { normalize } from "@cartridge/ui/utils";
import { connect } from "./connect";
import { deployFactory } from "./deploy";
import { estimateInvokeFee } from "./estimate";
import { execute } from "./execute";
import { probe } from "./probe";
import { openSettingsFactory } from "./settings";
import { signMessageFactory } from "./sign";
import { switchChain } from "./switchChain";
import { navigateFactory } from "./navigate";
import { ConnectionCtx } from "./types";
import { encodeStarterPack } from "@/utils/starterpack-url";

export function connectToController<ParentMethods extends object>({
  setRpcUrl,
  setContext,
  setController,
  setConfigSignupOptions,
  navigate,
  switchChainFromHook,
}: {
  setRpcUrl: (url: string) => void;
  setContext: (ctx: ConnectionCtx | undefined) => void;
  setController: (controller?: Controller) => void;
  setConfigSignupOptions: (options: AuthOptions | undefined) => void;
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
  switchChainFromHook: (rpcUrl: string) => Promise<void>;
}) {
  return connectToParent<ParentMethods>({
    methods: {
      connect: normalize(
        connect({
          setRpcUrl,
          setContext,
          setConfigSignupOptions,
        }),
      ),
      deploy: () => deployFactory(setContext),
      execute: () => execute({ navigate }),
      estimateInvokeFee: () => estimateInvokeFee,
      probe: normalize(probe({ setController })),
      signMessage: () => signMessageFactory(setContext),
      openSettings: () => openSettingsFactory(),
      navigate: () => navigateFactory(),
      reset: () => () => {
        setContext(undefined);
      },
      disconnect: () => async () => {
        // First clear the React state
        setContext(undefined);
        setController(undefined);
        // Then cleanup the controller
        await window.controller?.disconnect();
      },
      logout: () => async () => {
        // First clear the React state
        setContext(undefined);
        setController(undefined);
        // Then cleanup the controller
        await window.controller?.disconnect();
      },
      username: () => () => window.controller?.username(),
      delegateAccount: () => () => window.controller?.delegateAccount(),
      openPurchaseCredits: () => () => {
        setContext({
          type: "open-purchase-credits",
          resolve: () => Promise.resolve(),
          reject: () => Promise.reject(),
        });
      },
      openStarterPack: () => (options: string | StarterPack) => {
        // Navigate based on the type of options
        if (typeof options === "string") {
          navigate(`/purchase/starterpack/${options}`, { replace: true });
        } else {
          // For custom StarterPack objects, encode them in the URL
          const encodedData = encodeStarterPack(options);
          navigate(`/purchase/starterpack/custom?data=${encodedData}`, {
            replace: true,
          });
        }
      },
      switchChain: () => switchChain({ switchChainFromHook }),
    },
  });
}
