import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  GlobeIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  SpinnerIcon,
} from "@cartridge/controller-ui";
import { LocationGateOptions, ResponseCodes } from "@cartridge/controller";
import { defaultTheme } from "@cartridge/presets";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useNavigation } from "@/context";
import { useConnection } from "@/hooks/connection";
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

export type LocationGateResponse = {
  code: ResponseCodes;
  message: string;
};

const CANCEL_RESPONSE: LocationGateResponse = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

function errorResponse(gameName: string): LocationGateResponse {
  return {
    code: ResponseCodes.ERROR,
    message: `${gameName} is not available in your region.`,
  };
}

/**
 * GPS geofence verification UI. Rendered inline by the route that owns the
 * pending request (ConnectRoute) rather than on its own route: navigating the
 * owning route away mid-request unmounts it, and useRouteParams' unmount
 * cleanup deletes the stored connection callbacks — after which the parent
 * SDK's connect() promise can never settle and the modal hangs blank.
 *
 * On success, calls setLocationGateVerified(true) so the owning route resumes.
 * On cancel or a blocked region, reports the terminal response via onExit.
 */
export function LocationGate({
  gate,
  onExit,
  onVerified,
}: {
  gate: LocationGateOptions;
  onExit: (response: LocationGateResponse) => void;
  onVerified?: () => void;
}) {
  const { setLocationGateVerified, theme } = useConnection();
  const { setShowClose } = useNavigation();
  const [state, setState] = useState<GateState>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShowClose(true);
  }, [setShowClose]);

  const evaluateAndContinue = useCallback(
    (geo: ResolvedLocation) => {
      if (!geo.countryCode && !geo.regionCode) {
        throw new Error("Location could not be resolved");
      }

      const result = evaluateLocationGate({ gate, geo });
      if (!result.allowed) {
        setState("blocked");
        return;
      }

      setLocationGateVerified(true);
      onVerified?.();
    },
    [gate, onVerified, setLocationGateVerified],
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
    [evaluateAndContinue, handleLocationError],
  );

  useEffect(() => {
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
          if (permission.state === "denied") {
            setError("Location permission was denied.");
          }
        }
      })
      .catch(showPrompt);

    return () => {
      cancelled = true;
    };
  }, [requestLocation]);

  const handleContinue = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  const handleCancel = useCallback(() => {
    onExit(CANCEL_RESPONSE);
  }, [onExit]);

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

  if (state === "checking") {
    return (
      <>
        <HeaderInner
          title="Location Verification"
          icon={<GlobeIcon variant="solid" size="lg" />}
        />
        <LayoutContent className="p-4 items-center justify-center">
          <SpinnerIcon className="animate-spin text-foreground-300" size="lg" />
          <p className="text-sm text-foreground-300">
            Verifying your location…
          </p>
        </LayoutContent>
      </>
    );
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
            onClick={() => onExit(errorResponse(gameName))}
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
