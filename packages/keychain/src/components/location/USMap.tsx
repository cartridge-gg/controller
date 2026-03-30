import { useMemo } from "react";
import { STATE_PATHS } from "./us-state-paths";

type USMapProps = {
  /** Region codes to highlight as blocked, e.g. ["US-HI", "US-NY"] */
  blockedStates: string[];
};

export function USMap({ blockedStates }: USMapProps) {
  const blockedSet = useMemo(
    () => new Set(blockedStates.map((s) => s.toUpperCase())),
    [blockedStates],
  );

  return (
    <svg
      viewBox="0 0 960 610"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      role="img"
      aria-label="Map of the United States showing restricted states"
    >
      {Object.entries(STATE_PATHS).map(([code, d]) => {
        const isBlocked = blockedSet.has(code);
        return (
          <path
            key={code}
            d={d}
            className={
              isBlocked
                ? "fill-background-200 stroke-background"
                : "fill-primary-100 stroke-background"
            }
            strokeWidth={0.5}
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}
