import { cn } from "@/utils";

interface AchievementBitProps {
  completed?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export function AchievementBit({
  completed,
  active,
  onClick,
}: AchievementBitProps) {
  return (
    <div
      className={cn(
        "h-2.5 w-2.5 cursor-pointer hover:opacity-100",
        completed ? "bg-primary" : "bg-foreground-400",
        active ? "opacity-100" : "opacity-50",
      )}
      onClick={onClick}
    />
  );
}

export default AchievementBit;
