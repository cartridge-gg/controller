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
import { hasStorageAccessFactory } from "./storage-access";

export type { ControllerError } from "./execute";

export function connectToController<ParentMethods extends object>({
  setRpcUrl,
  setController,
  navigate,
}: {
  setRpcUrl: (url: string) => void;
  setController: (controller?: Controller) => void;
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
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
      execute: () => execute({ navigate }),
      estimateInvokeFee: () => estimateInvokeFee,
      probe: normalize(probe({ setController })),
      signMessage: () =>
        signMessageFactory({
          navigate,
        }),
      openSettings: () => openSettingsFactory(),
      navigate: () => navigateFactory(),
      hasStorageAccess: () => hasStorageAccessFactory(),
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
      openStarterPack: () => (starterpackId: string) => {
        navigate(`/purchase/starterpack/${starterpackId}`, { replace: true });
      },
      switchChain: () => switchChain({ setController, setRpcUrl }),
    },
  });
}
