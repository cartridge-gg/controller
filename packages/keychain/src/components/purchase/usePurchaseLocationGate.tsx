import { useCallback, useRef, useState } from "react";
import { useConnection } from "@/hooks/connection";
import { useGeoLocation } from "@/hooks/geo";
import { hasConfiguredLocationGate } from "@/utils/location-gate";
import { LocationGate } from "@/components/location/LocationGate";

type PurchaseAction = () => void | Promise<void>;

/**
 * Requires a fresh location check before each purchase attempt for US users of
 * games with a configured location gate. An already-granted browser permission
 * is checked silently by LocationGate; denied/prompt permissions show its
 * recovery UI.
 */
export function usePurchaseLocationGate() {
  const { locationGate } = useConnection();
  const { isUS } = useGeoLocation();
  const [isPending, setIsPending] = useState(false);
  const pendingActionRef = useRef<PurchaseAction>();

  const runAfterLocationGate = useCallback(
    (action: PurchaseAction) => {
      if (!isUS || !hasConfiguredLocationGate(locationGate)) {
        void action();
        return;
      }

      pendingActionRef.current = action;
      setIsPending(true);
    },
    [isUS, locationGate],
  );

  const continuePendingPurchase = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = undefined;
    setIsPending(false);
    void action?.();
  }, []);

  const cancelPendingPurchase = useCallback(() => {
    pendingActionRef.current = undefined;
    setIsPending(false);
  }, []);

  return {
    runAfterLocationGate,
    locationGateView:
      isPending && locationGate ? (
        <LocationGate
          gate={locationGate}
          onExit={cancelPendingPurchase}
          onVerified={continuePendingPurchase}
          persistVerification={false}
        />
      ) : null,
  };
}
