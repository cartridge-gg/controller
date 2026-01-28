import { useCallback, useEffect, useState } from "react";
import {
  Button,
  GlobeIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { ResponseCodes } from "@cartridge/controller";
import { ErrorAlert } from "@/components/ErrorAlert";
import {
  useRouteCallbacks,
  useRouteCompletion,
  useRouteParams,
} from "@/hooks/route";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { parseLocationPromptParams } from "@/utils/connection/location";
import { useNavigation } from "@/context";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

type LocationState = "idle" | "requesting";

export function LocationPrompt() {
  const params = useRouteParams(parseLocationPromptParams);
  const handleCompletion = useRouteCompletion();
  const { cancelWithoutClosing } = useRouteCallbacks(params, CANCEL_RESPONSE);
  const { setShowClose } = useNavigation();
  const [state, setState] = useState<LocationState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShowClose(true);
  }, [setShowClose]);

  const handleContinue = useCallback(() => {
    if (!params) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location services are not available in this browser.");
      return;
    }

    setError(null);
    setState("requesting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { coords, timestamp } = position;
        params.resolve?.({
          code: ResponseCodes.SUCCESS,
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            altitude: coords.altitude,
            altitudeAccuracy: coords.altitudeAccuracy,
            heading: coords.heading,
            speed: coords.speed,
            timestamp,
          },
        });

        cleanupCallbacks(params.params.id);
        handleCompletion();
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
  }, [params, handleCompletion]);

  const handleCancel = useCallback(() => {
    cancelWithoutClosing();
    handleCompletion();
  }, [cancelWithoutClosing, handleCompletion]);

  if (!params) {
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
          This game needs your location to verify eligibility. We'll share your
          location with the game to complete verification.
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
