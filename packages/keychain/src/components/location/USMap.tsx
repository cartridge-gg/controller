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
    <div>
      <div className="flex items-center justify-end gap-4 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-primary-100" />
          <span className="text-xs text-foreground-300">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-background-200" />
          <span className="text-xs text-foreground-300">Restricted</span>
        </div>
      </div>
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
              strokeWidth={0.7}
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
    </div>
  );
}
