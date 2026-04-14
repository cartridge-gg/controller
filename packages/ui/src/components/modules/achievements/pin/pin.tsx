import { Button, TrackIcon } from "@/index";
import { useCallback, useState } from "react";

export interface AchievementPinProps {
  pinned?: boolean;
  achievementId?: string;
  disabled?: boolean;
  onClick?: (
    pinned: boolean,
    achievementId: string,
    setLoading: (loading: boolean) => void,
  ) => void;
}

export function AchievementPin({
  pinned,
  achievementId,
  disabled,
  onClick,
}: AchievementPinProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.(!!pinned, achievementId ?? "", setLoading);
  }, [disabled, onClick, pinned, achievementId, setLoading]);

  return (
    <Button
      variant="tertiary"
      size="tall"
      className="grow"
      isLoading={loading}
      isActive={pinned}
      disabled={disabled}
      onClick={handleClick}
    >
      <TrackIcon size="sm" variant={pinned ? "solid" : "line"} />
    </Button>
  );
}

export default AchievementPin;
