export * from "./types";

import { connectToParent } from "@cartridge/penpal";
import Controller from "#utils/controller";
import { connect } from "./connect";
import { execute } from "./execute";
import { estimateInvokeFee } from "./estimate";
import { probe } from "./probe";
import { signMessageFactory } from "./sign";
import { ConnectionCtx } from "./types";
import { deployFactory } from "./deploy";
import { openSettingsFactory } from "./settings";
import { normalize } from "@cartridge/utils";
import { switchChain } from "./switchChain";

export function connectToController<ParentMethods extends object>({
  setRpcUrl,
  setContext,
  setController,
}: {
  setRpcUrl: (url: string) => void;
  setContext: (ctx: ConnectionCtx) => void;
  setController: (controller?: Controller) => void;
}) {
  return connectToParent<ParentMethods>({
    methods: {
      connect: normalize(
        connect({
          setRpcUrl,
          setContext,
        }),
      ),
      deploy: () => deployFactory(setContext),
      execute: () => execute({ setContext }),
      estimateInvokeFee: () => estimateInvokeFee,
      probe: normalize(probe({ setController })),
      signMessage: () => signMessageFactory(setContext),
      openSettings: () => openSettingsFactory(setContext),
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
