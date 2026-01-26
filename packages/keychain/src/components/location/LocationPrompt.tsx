import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
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
      <LayoutContent className="p-4 gap-4">
        <div className="relative w-full overflow-hidden rounded-2xl border border-foreground-700 bg-foreground-950/40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(221, 209, 255, 0.35), transparent 55%), radial-gradient(circle at 80% 60%, rgba(221, 209, 255, 0.25), transparent 50%)",
            }}
          />
          <div className="relative flex aspect-[4/3] items-center justify-center">
            <GlobeIcon
              variant="solid"
              size="xl"
              className="text-primary-100 opacity-70"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-4 text-sm text-foreground-300">
            Cartridge offers skill-based, real money games in 39 states. We're
            legally required to ask for your location to ensure you can play for
            prizes in your state.
          </CardContent>
        </Card>
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
