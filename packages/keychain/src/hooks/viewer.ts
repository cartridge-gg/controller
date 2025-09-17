import { useMemo } from "react";
import { useAccount, useAccountProfile } from "./account";
import { useConnection } from "./connection";

export type UseViewerAddressResponse = {
  address: string | undefined;
  isViewOnly: boolean;
  hasController: boolean;
};

/**
 * Hook to get the viewer address for inventory/collectibles
 * Returns controller address if connected, otherwise falls back to URL path address
 */
export function useViewerAddress(): UseViewerAddressResponse {
  const { controller } = useConnection();
  const connectedAccount = useAccount();
  const profileAccount = useAccountProfile({ overridable: true });

  const hasController = useMemo(() => {
    return !!controller && !!connectedAccount?.address;
  }, [controller, connectedAccount]);

  const address = useMemo(() => {
    // Use connected account if available
    if (connectedAccount?.address) {
      return connectedAccount.address;
    }
    // Fall back to profile address from URL
    return profileAccount.address;
  }, [connectedAccount, profileAccount]);

  const isViewOnly = useMemo(() => {
    // View only if no controller connected OR if viewing another account
    if (!hasController) return true;
    if (!profileAccount.address) return false;
    return connectedAccount?.address !== profileAccount.address;
  }, [hasController, connectedAccount, profileAccount]);

  return {
    address,
    isViewOnly,
    hasController,
  };
}
