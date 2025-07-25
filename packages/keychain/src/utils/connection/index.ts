export * from "./types";

import Controller from "@/utils/controller";
import { AuthOptions } from "@cartridge/controller";
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

export function connectToController<ParentMethods extends object>({
  setRpcUrl,
  setContext,
  setController,
  setConfigSignupOptions,
}: {
  setRpcUrl: (url: string) => void;
  setContext: (ctx: ConnectionCtx | undefined) => void;
  setController: (controller?: Controller) => void;
  setConfigSignupOptions: (options: AuthOptions | undefined) => void;
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
      execute: () => execute({ setContext }),
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
      switchChain: () => switchChain({ setController, setRpcUrl }),
    },
  });
}
