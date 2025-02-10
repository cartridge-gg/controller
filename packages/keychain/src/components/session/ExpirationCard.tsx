import { ClockIcon } from "@cartridge/ui-next";
import { AccordionCard } from "./AccordionCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cartridge/ui-next";

interface ExpirationCardProps {
  duration: bigint;
  onDurationChange: (duration: bigint) => void;
  isExpanded?: boolean;
}

export function ExpirationCard({
  duration,
  onDurationChange,
  isExpanded,
}: ExpirationCardProps) {
  return (
    <AccordionCard
      icon={<ClockIcon variant="solid" />}
      title="Session Expiration"
      trigger={
        <div className="text-xs text-foreground-400">
          Expires in&nbsp;
          <span className="text-accent-foreground font-bold">
            {formatDuration(duration)}
          </span>
        </div>
      }
      isExpanded={isExpanded}
    >
      <div className="flex flex-col gap-4 p-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="text-foreground-400">Duration</div>
          <Select
            value={duration.toString()}
            onValueChange={(val) => onDurationChange(BigInt(val))}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="1 HR" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={(60 * 60).toString()}>1 HR</SelectItem>
              <SelectItem value={(60 * 60 * 24).toString()}>24 HRS</SelectItem>
              <SelectItem value={(60 * 60 * 24 * 7).toString()}>
                1 WEEK
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </AccordionCard>
  );
}

function formatDuration(seconds: bigint): string {
  const hours = Number(seconds) / 3600;
  if (hours === 1) return "1 hour";
  if (hours === 24) return "24 hours";
  if (hours === 168) return "1 week";
  return `${hours} hours`;
}
