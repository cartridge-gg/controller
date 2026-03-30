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
import { useConnection } from "@/hooks/connection";
import { cleanupCallbacks, getCallbacks } from "@/utils/connection/callbacks";
import { evaluateLocationGate } from "@/utils/location-gate";
import { getIpLocation } from "@/utils/ip";
import { USMap } from "./USMap";

type GateState = "checking" | "blocked" | "error";

const ERROR_RESPONSE = {
  code: ResponseCodes.ERROR,
  message: "This game is not available in your region.",
};

export function LocationGate() {
  const { closeModal, setLocationGateVerified } = useConnection();
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

  // Auto-check IP location on mount once gate is available
  useEffect(() => {
    if (!gate || !returnTo) return;

    let cancelled = false;

    (async () => {
      try {
        const geo = await getIpLocation();
        if (cancelled) return;

        const result = evaluateLocationGate({ gate, geo });

        if (result.allowed) {
          setLocationGateVerified(true);
          navigate(returnTo, { replace: true });
        } else {
          setState("blocked");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Location gate check failed:", err);
        setError("Unable to verify location.");
        setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gate, returnTo, navigate, setLocationGateVerified]);

  const blockedUSStates = useMemo(() => {
    if (!gate?.blocked) return [];
    return gate.blocked.filter((code) => code.toUpperCase().startsWith("US-"));
  }, [gate]);

  // Show nothing while checking
  if (state === "checking") {
    return null;
  }

  if (state === "error") {
    return (
      <>
        <HeaderInner
          title="Location Check"
          icon={<GlobeIcon variant="solid" size="lg" />}
        />
        <LayoutContent className="p-4">
          {error && (
            <ErrorAlert title="Error" description={error} isExpanded={true} />
          )}
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
        title="Region Restricted"
        icon={<GlobeIcon variant="solid" size="lg" />}
      />
      <LayoutContent className="p-4">
        {blockedUSStates.length > 0 && (
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
