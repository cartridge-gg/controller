import { Button, XIcon } from "@/index";
import { useCallback, useMemo } from "react";

export interface AchievementShareProps {
  website?: string;
  twitter?: string;
  timestamp?: number;
  points?: number;
  difficulty?: number;
  title?: string;
  disabled?: boolean;
}

export function AchievementShare({
  disabled,
  website,
  twitter,
  timestamp,
  points,
  difficulty,
  title,
}: AchievementShareProps) {
  const url: string | null = useMemo(() => {
    if (!website) return null;
    return website;
  }, [website]);

  const xhandle = useMemo(() => {
    if (!twitter) return null;
    // Take the last part of the url
    return twitter.split("/").pop();
  }, [twitter]);

  const date = useMemo(() => {
    if (!timestamp) return null;
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [timestamp]);

  const handleShare = useCallback(() => {
    if (!url || !xhandle) return;
    const content = `I earned ${points} points by unlocking 🏆 ${title} in @${xhandle}. Only ${difficulty}% of players have earned this achievement.

Play now 👇`;

    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      content,
    )}&url=${encodeURIComponent(url)}`;

    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  }, [url, xhandle, title, points, date, difficulty]);

  return (
    <Button
      variant="tertiary"
      size="tall"
      className="grow"
      disabled={disabled}
      onClick={handleShare}
    >
      <XIcon size="sm" />
    </Button>
  );
}

export default AchievementShare;
