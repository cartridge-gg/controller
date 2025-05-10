import { cn } from "@/utils";

interface AchievementIconProps {
  icon?: string;
  completed?: boolean;
}

export function AchievementIcon({ icon, completed }: AchievementIconProps) {
  return (
    <div
      className={cn(
        "w-8 h-8 flex items-center justify-center",
        completed ? "text-primary" : "text-foreground-300",
      )}
    >
      <div className={cn("h-6 w-6", icon || "fa-trophy", "fa-solid")} />
    </div>
  );
}

export default AchievementIcon;
