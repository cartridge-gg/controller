import { Button, TrackIcon } from "@/index";

interface PinAchievementProps {
  pinned?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function PinAchievement({
  pinned,
  loading,
  disabled,
  onClick,
}: PinAchievementProps) {
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

export default PinAchievement;
