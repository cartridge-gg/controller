import { cn } from "@/index";

interface AchievementIconProps {
  icon?: string;
  completed?: boolean;
}

export function AchievementIcon({ icon, completed }: AchievementIconProps) {
  return (
    <div className="h-8 w-8 flex justify-center items-center">
      <div
        className={cn(
          "h-6 w-6 fa-solid",
          icon || "fa-trophy",
          completed ? "text-primary" : "text-foreground-300",
        )}
      />
    </div>
  );
}

export default AchievementIcon;
