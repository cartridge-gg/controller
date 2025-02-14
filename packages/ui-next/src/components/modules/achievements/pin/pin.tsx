import { Button, TrackIcon } from "@/index";

export interface AchievementPinProps {
  pinned?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function AchievementPin({
  pinned,
  loading,
  disabled,
  onClick,
}: AchievementPinProps) {
  return (
    <Button
      variant="tertiary"
      size="tall"
      className="grow"
      isLoading={loading}
      isActive={pinned}
      disabled={disabled}
      onClick={onClick}
    >
      <TrackIcon size="sm" variant={pinned ? "solid" : "line"} />
    </Button>
  );
}

export default AchievementPin;
