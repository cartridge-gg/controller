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
import { loadConfig } from "@cartridge/presets";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useNavigation } from "@/context";
import { useConnection } from "@/hooks/connection";
import { cleanupCallbacks, getCallbacks } from "@/utils/connection/callbacks";
import {
  evaluateLocationGate,
  reverseGeocodeLocation,
} from "@/utils/location-gate";
import { getIpCountry, getIpGeo } from "@/utils/ip";
import { USMap } from "./USMap";

type GateState = "idle" | "requesting" | "blocked";

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
  const { closeModal, setLocationGateVerified } = useConnection();
  const { search } = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<GateState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isUS, setIsUS] = useState<boolean | null>(null);

  useEffect(() => {
    setShowClose(true);
  }, [setShowClose]);

  useEffect(() => {
    getIpCountry().then((country) => setIsUS(country === "US"));
  }, []);

  const [presetGate, setPresetGate] = useState<LocationGateOptions | null>(
    null,
  );

  const { returnTo, gateFromUrl, preset } = useMemo(() => {
    const searchParams = new URLSearchParams(search);
    const returnToParam = searchParams.get("returnTo");
    const gateParam = searchParams.get("gate");
    const presetParam = searchParams.get("preset");

    let parsedGate: LocationGateOptions | null = null;
    if (gateParam) {
      try {
        parsedGate = JSON.parse(gateParam) as LocationGateOptions;
      } catch (parseError) {
        console.error("Failed to parse location gate params:", parseError);
      }
    }

    return {
      returnTo: returnToParam,
      gateFromUrl: parsedGate,
      preset: presetParam,
    };
  }, [search]);

  useEffect(() => {
    if (!preset || gateFromUrl) return;
    loadConfig(preset)
      .then((config) => {
        const configObj = config as Record<string, unknown> | null;
        if (configObj?.locationGate) {
          setPresetGate(configObj.locationGate as LocationGateOptions);
        }
      })
      .catch((err) => console.error("Failed to load preset config:", err));
  }, [preset, gateFromUrl]);

  const gate = gateFromUrl ?? presetGate;

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
            setState("blocked");
            return;
          }

          setLocationGateVerified(true);
          navigate(returnTo, { replace: true });
        } catch (geoError) {
          console.error("Location gate failed:", geoError);
          setState("idle");
          setError("Unable to verify location.");
        }
      },
      async (geoError) => {
        // Browser denied geolocation (common in cross-origin iframes on
        // Brave, mobile WebViews, etc.) — fall back to IP-based location.
        if (geoError?.code === 1) {
          try {
            const ipGeo = await getIpGeo();
            if (!ipGeo.countryCode) {
              setState("idle");
              setError("Unable to verify location.");
              return;
            }

            const gateResult = evaluateLocationGate({
              gate: gate!,
              geo: {
                countryCode: ipGeo.countryCode,
                regionCode: ipGeo.regionCode,
              },
            });

            if (!gateResult.allowed) {
              setState("blocked");
              return;
            }

            setLocationGateVerified(true);
            navigate(returnTo!, { replace: true });
            return;
          } catch {
            setState("idle");
            setError("Unable to verify location.");
            return;
          }
        }

        setState("idle");
        setError(geoError?.message || "Unable to verify location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  }, [gate, navigate, returnTo, setLocationGateVerified]);

  const blockedUSStates = useMemo(() => {
    if (!gate?.blocked) return [];
    return gate.blocked.filter((code) => code.toUpperCase().startsWith("US-"));
  }, [gate]);

  // Show map if there are blocked US states and we haven't confirmed the user is outside the US.
  // isUS: null = still loading/failed, true = confirmed US, false = confirmed non-US
  const showMap = blockedUSStates.length > 0 && isUS !== false;

  if (!gate) {
    return null;
  }

  if (state === "blocked") {
    return (
      <>
        <HeaderInner
          title="Region Restricted"
          icon={<GlobeIcon variant="solid" size="lg" />}
        />
        <LayoutContent className="p-4">
          {showMap && (
            <div className="mb-3">
              <USMap blockedStates={blockedUSStates} />
            </div>
          )}
          <p className="text-sm text-foreground-300 leading-relaxed">
            This game is not available in your region.
          </p>
        </LayoutContent>
        <LayoutFooter>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => resolveConnect(ERROR_RESPONSE)}
          >
            CLOSE
          </Button>
        </LayoutFooter>
      </>
    );
  }

  return (
    <>
      <HeaderInner
        title="Location Verification"
        icon={<GlobeIcon variant="solid" size="lg" />}
      />
      <LayoutContent className="p-4 gap-3">
        {showMap && <USMap blockedStates={blockedUSStates} />}
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
