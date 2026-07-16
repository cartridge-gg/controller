import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  GlobeIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/controller-ui";
import { LocationGateOptions, ResponseCodes } from "@cartridge/controller";
import { defaultTheme, loadConfig } from "@cartridge/presets";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useConnection } from "@/hooks/connection";
import { cleanupCallbacks, getCallbacks } from "@/utils/connection/callbacks";
import {
  evaluateLocationGate,
  reverseGeocodeLocation,
} from "@/utils/location-gate";
import { getLocationPermissionHelp, getSupportedUSStates } from "./location-ui";
import { USMap } from "./USMap";

type GateState = "checking" | "idle" | "requesting" | "blocked";

type ResolvedLocation = {
  countryCode?: string | null;
  regionCode?: string | null;
};

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

function errorResponse(gameName: string) {
  return {
    code: ResponseCodes.ERROR,
    message: `${gameName} is not available in your region.`,
  };
}

export function LocationGate() {
  const { closeModal, setLocationGateVerified, theme } = useConnection();
  const { search } = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<GateState>("checking");
  const [error, setError] = useState<string | null>(null);

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

  const evaluateAndContinue = useCallback(
    (geo: ResolvedLocation) => {
      if (!gate || !returnTo) {
        throw new Error("Location requirements are missing");
      }
      if (!geo.countryCode && !geo.regionCode) {
        throw new Error("Location could not be resolved");
      }

      const result = evaluateLocationGate({ gate, geo });
      if (!result.allowed) {
        setState("blocked");
        return;
      }

      setLocationGateVerified(true);
      navigate(returnTo, { replace: true });
    },
    [gate, navigate, returnTo, setLocationGateVerified],
  );

  const handleLocationError = useCallback(
    (geoError?: Pick<GeolocationPositionError, "code" | "message">) => {
      setState("idle");
      if (geoError?.code === 1) {
        setError("Location permission was denied.");
        return;
      }
      setError(geoError?.message || "Unable to verify location.");
    },
    [],
  );

  const requestLocation = useCallback(
    (silent = false) => {
      if (!gate || !returnTo) {
        setState("idle");
        setError("Location requirements are missing.");
        return;
      }

      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setState("idle");
        setError("Location services are not available in this browser.");
        return;
      }

      setError(null);
      setState(silent ? "checking" : "requesting");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          void (async () => {
            try {
              const geo = await reverseGeocodeLocation(position.coords);
              evaluateAndContinue({
                countryCode: geo.countryCode ?? null,
                regionCode: geo.regionCode ?? null,
              });
            } catch (locationError) {
              console.error("Location gate failed:", locationError);
              setState("idle");
              setError("Unable to verify location.");
            }
          })();
        },
        handleLocationError,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        },
      );
    },
    [evaluateAndContinue, gate, handleLocationError, returnTo],
  );

  useEffect(() => {
    if (!gate || !returnTo) return;

    let cancelled = false;
    const showPrompt = () => {
      if (!cancelled) setState("idle");
    };

    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      showPrompt();
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((permission) => {
        if (cancelled) return;
        if (permission.state === "granted") {
          requestLocation(true);
        } else {
          setState("idle");
        }
      })
      .catch(showPrompt);

    return () => {
      cancelled = true;
    };
  }, [gate, requestLocation, returnTo]);

  const handleContinue = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  const handleCancel = useCallback(() => {
    resolveConnect(CANCEL_RESPONSE);
  }, [resolveConnect]);

  const gameName =
    theme.name && theme.name !== defaultTheme.name ? theme.name : "This game";

  const supportedUSStates = useMemo(() => getSupportedUSStates(gate), [gate]);

  const permissionHelp = useMemo(
    () =>
      getLocationPermissionHelp(
        typeof navigator === "undefined" ? "" : navigator.userAgent,
      ),
    [],
  );

  if (!gate || state === "checking") {
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
          <div className="mb-3">
            <USMap supportedStates={supportedUSStates} />
          </div>
          <p className="text-sm text-foreground-300 leading-relaxed">
            {gameName} is not available in your region.
          </p>
        </LayoutContent>
        <LayoutFooter>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => resolveConnect(errorResponse(gameName))}
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
        <USMap supportedStates={supportedUSStates} />
        <p className="text-sm text-foreground-300 leading-relaxed">
          {gameName} needs your location to confirm availability in your region.
        </p>
      </LayoutContent>
      <LayoutFooter>
        {error && (
          <ErrorAlert
            title="Error"
            description={
              error === "Location permission was denied." ? (
                <>
                  <span>{error} </span>
                  <a
                    href={permissionHelp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Learn how to enable location in {permissionHelp.name}.
                  </a>
                </>
              ) : (
                error
              )
            }
            isExpanded={true}
          />
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
