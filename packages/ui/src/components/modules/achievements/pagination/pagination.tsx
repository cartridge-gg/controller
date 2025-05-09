import { Button, WedgeIcon } from "@/index";

interface AchievementPaginationProps {
  direction: "left" | "right";
  disabled?: boolean;
  onClick?: () => void;
}

export function AchievementPagination({
  direction,
  disabled,
  onClick,
}: AchievementPaginationProps) {
  return (
    <Button
      variant="icon"
      size="icon"
      className="rounded-none text-foreground-300 hover:text-foreground-200"
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

export default AchievementPagination;
