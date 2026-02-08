import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  GlobeIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { LocationGateOptions, ResponseCodes } from "@cartridge/controller";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useNavigation } from "@/context";
import { useConnection } from "@/hooks/connection";
import { cleanupCallbacks, getCallbacks } from "@/utils/connection/callbacks";
import {
  evaluateLocationGate,
  reverseGeocodeLocation,
} from "@/utils/location-gate";

type GateState = "idle" | "requesting";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

const ERROR_RESPONSE = {
  code: ResponseCodes.ERROR,
  message: "This game is not available in your region.",
};

export function LocationGate() {
  const { setShowClose } = useNavigation();
  const { closeModal } = useConnection();
  const { search } = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<GateState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShowClose(true);
  }, [setShowClose]);

  const { returnTo, gate } = useMemo(() => {
    const searchParams = new URLSearchParams(search);
    const returnToParam = searchParams.get("returnTo");
    const gateParam = searchParams.get("gate");

    let parsedGate: LocationGateOptions | null = null;
    if (gateParam) {
      try {
        parsedGate = JSON.parse(gateParam) as LocationGateOptions;
      } catch (parseError) {
        console.error("Failed to parse location gate params:", parseError);
      }
    }

    return { returnTo: returnToParam, gate: parsedGate };
  }, [search]);

  const connectId = useMemo(() => {
    if (!returnTo) {
      return null;
    }
    try {
      const url = new URL(returnTo, window.location.origin);
      return url.searchParams.get("id");
    } catch (err) {
      console.error("Failed to parse returnTo:", err);
      return null;
    }
  }, [returnTo]);

  const resolveConnect = useCallback(
    (response: { code: ResponseCodes; message: string }) => {
      if (connectId) {
        const callbacks = getCallbacks(connectId);
        callbacks?.resolve?.(response);
        cleanupCallbacks(connectId);
      }
      closeModal?.();
    },
    [connectId, closeModal],
  );

  const handleCancel = useCallback(() => {
    resolveConnect(CANCEL_RESPONSE);
  }, [resolveConnect]);

  const handleContinue = useCallback(() => {
    if (!gate || !returnTo) {
      setError("Location requirements are missing.");
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location services are not available in this browser.");
      return;
    }

    setError(null);
    setState("requesting");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { coords, timestamp } = position;
          const geo = await reverseGeocodeLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            altitude: coords.altitude,
            altitudeAccuracy: coords.altitudeAccuracy,
            heading: coords.heading,
            speed: coords.speed,
            timestamp,
          });

          const gateResult = evaluateLocationGate({ gate, geo });

          if (!gateResult.allowed) {
            resolveConnect(ERROR_RESPONSE);
            return;
          }

          navigate(returnTo, { replace: true });
        } catch (geoError) {
          console.error("Location gate failed:", geoError);
          setState("idle");
          setError("Unable to verify location.");
        }
      },
      (geoError) => {
        setState("idle");
        if (geoError?.code === 1) {
          setError("Location permission was denied.");
          return;
        }
        setError(geoError?.message || "Unable to verify location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  }, [gate, navigate, returnTo, resolveConnect]);

  if (!gate) {
    return null;
  }

  return (
    <>
      <HeaderInner
        title="Location Verification"
        icon={<GlobeIcon variant="solid" size="lg" />}
      />
      <LayoutContent className="p-4">
        <p className="text-sm text-foreground-300 leading-relaxed">
          This game needs your location to confirm availability in your region.
        </p>
      </LayoutContent>
      <LayoutFooter>
        {error && (
          <ErrorAlert title="Error" description={error} isExpanded={true} />
        )}
        <Button
          variant="primary"
          className="w-full"
          onClick={handleContinue}
          isLoading={state === "requesting"}
        >
          CONTINUE
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleCancel}
          disabled={state === "requesting"}
        >
          CANCEL
        </Button>
      </LayoutFooter>
    </>
  );
}
