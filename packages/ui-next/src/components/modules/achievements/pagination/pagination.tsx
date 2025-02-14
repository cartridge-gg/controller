import { Button, WedgeIcon } from "@/index";

interface PaginationAchievementProps {
  direction: "left" | "right";
  disabled?: boolean;
  onClick?: () => void;
}

export function PaginationAchievement({
  direction,
  disabled,
  onClick,
}: PaginationAchievementProps) {
  return (
    <Button
      variant="icon"
      size="icon"
      className="rounded-none"
      disabled={disabled}
      onClick={onClick}
    >
      {direction === "left" ? (
        <WedgeIcon variant="left" size="sm" />
      ) : (
        <WedgeIcon variant="right" size="sm" />
      )}
    </Button>
  );
}

export default PaginationAchievement;
