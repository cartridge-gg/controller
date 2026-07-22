import { useCreateSession } from "@/hooks/session";
import {
  ClockIcon,
  ToggleGroup,
  ToggleGroupItem,
} from "@cartridge/controller-ui";

export function ExpirationCard() {
  const { isEditable, duration, playTimeMaxDurationSeconds, onDurationChange } =
    useCreateSession();

  // Disable preset options that exceed the player-controls play-time cap.
  const isOverCap = (seconds: number) =>
    playTimeMaxDurationSeconds !== null &&
    BigInt(seconds) > playTimeMaxDurationSeconds;

  return (
    <div className="w-full flex flex-row items-center justify-between font-medium text-sm">
      <h1 className="text-foreground-400">Expires In:</h1>
      {!isEditable ? (
        <div className="text-foreground-300 flex flex-row items-center py-1.5">
          <ClockIcon variant="line" />
          <h1>{formatDuration(duration)}</h1>
        </div>
      ) : (
        <ToggleGroup
          value={duration.toString()}
          onValueChange={(value) => {
            if (value) {
              onDurationChange(BigInt(value));
            }
          }}
          type="single"
          className="rounded-full border border-background-200 gap-0 divide-x divide-background-200 text-sm font-medium text-foreground-400"
        >
          <ToggleGroupItem
            value={(60 * 60).toString()}
            aria-label="1 hour"
            disabled={isOverCap(60 * 60)}
            className="rounded-l-full p-4 data-[state=on]:bg-background-200 data-[state=on]:text-foreground hover:text-foreground-200 bg-background-100 hover:bg-background-100"
          >
            1h
          </ToggleGroupItem>
          <ToggleGroupItem
            value={(60 * 60 * 24).toString()}
            aria-label="24 hours"
            disabled={isOverCap(60 * 60 * 24)}
            className="p-4 data-[state=on]:bg-background-200 data-[state=on]:text-foreground rounded-none hover:text-foreground-200 bg-background-100 hover:bg-background-100"
          >
            24h
          </ToggleGroupItem>
          <ToggleGroupItem
            value={(60 * 60 * 24 * 7).toString()}
            aria-label="1 week"
            disabled={isOverCap(60 * 60 * 24 * 7)}
            className="p-4 data-[state=on]:bg-background-200 data-[state=on]:text-foreground rounded-none hover:text-foreground-200 bg-background-100 hover:bg-background-100"
          >
            7d
          </ToggleGroupItem>
          <ToggleGroupItem
            value={(60 * 60 * 24 * 365 * 100).toString()}
            aria-label="Never"
            disabled={isOverCap(60 * 60 * 24 * 365 * 100)}
            className="rounded-r-full p-4 data-[state=on]:bg-background-200 data-[state=on]:text-foreground hover:text-foreground-200 bg-background-100 hover:bg-background-100"
          >
            Never
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </div>
  );
}

function formatDuration(seconds: bigint): string {
  const hours = Number(seconds) / 3600;
  if (hours === 1) return "1 hour";
  if (hours === 24) return "24 hours";
  if (hours === 168) return "1 week";
  return `${hours} hours`;
}
