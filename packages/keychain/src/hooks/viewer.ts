import { useMemo } from "react";
import { useAccount, useAccountProfile } from "./account";

export type UseViewerAddressResponse = {
  address: string | undefined;
  isOwner: boolean;
  canPerformActions: boolean;
};

/**
 * Hook to get the viewer address for inventory/collectibles
 * Always uses the address from the URL path for viewing
 * Actions are only available when viewing your own connected account
 */
export function useViewerAddress(): UseViewerAddressResponse {
  const profileAccount = useAccountProfile(); // Always from URL path
  const connectedAccount = useAccount(); // Connected controller if any

  const viewerAddress = profileAccount.address;

  const isOwner = useMemo(() => {
    if (!viewerAddress || !connectedAccount?.address) return false;
    return connectedAccount.address === viewerAddress;
  }, [connectedAccount?.address, viewerAddress]);

  const canPerformActions = useMemo(() => {
    return isOwner && !!connectedAccount;
  }, [isOwner, connectedAccount]);

  return {
    address: viewerAddress,
    isOwner,
    canPerformActions,
  };
}
