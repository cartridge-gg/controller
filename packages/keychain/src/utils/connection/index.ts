import Controller from "@/utils/controller";
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
import { StarterpackOptions } from "@cartridge/controller";

export type { ControllerError } from "./execute";

export function connectToController<ParentMethods extends object>({
  setRpcUrl,
  setController,
  navigate,
  propagateError,
  errorDisplayMode,
}: {
  setRpcUrl: (url: string) => void;
  setController: (controller?: Controller) => void;
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
  propagateError?: boolean;
  errorDisplayMode?: "modal" | "notification" | "silent";
}) {
  return connectToParent<ParentMethods>({
    methods: {
      connect: normalize(
        connect({
          navigate,
          setRpcUrl,
        }),
      ),
      deploy: () => deployFactory({ navigate }),
      execute: normalize(
        execute({ navigate, propagateError, errorDisplayMode }),
      ),
      estimateInvokeFee: () => estimateInvokeFee,
      probe: normalize(probe({ setController })),
      signMessage: normalize(
        signMessageFactory({
          navigate,
        }),
      ),
      openSettings: () => openSettingsFactory(),
      navigate: () => navigateFactory(),
      reset: () => () => {
        // Reset handled by navigation
      },
      disconnect: () => async () => {
        // First clear the React state
        setController(undefined);
        // Then cleanup the controller
        await window.controller?.disconnect();
      },
      logout: () => async () => {
        // First clear the React state
        setController(undefined);
        // Then cleanup the controller
        await window.controller?.disconnect();
      },
      username: () => () => window.controller?.username(),
      delegateAccount: () => () => window.controller?.delegateAccount(),
      openPurchaseCredits: () => () => {
        navigate("/funding", { replace: true });
      },
      openStarterPack:
        () => (id: string | number, options?: StarterpackOptions) => {
          navigate(
            `/purchase/starterpack/${id}${options?.preimage ? `?preimage=${options.preimage}` : ""}`,
            { replace: true },
          );
        },
      switchChain: () => switchChain({ setController, setRpcUrl }),
    },
  });
}
