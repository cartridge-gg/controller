import { Button, XIcon } from "@/index";

interface ShareAchievementProps {
  disabled?: boolean;
  onClick?: () => void;
}

export function ShareAchievement({ disabled, onClick }: ShareAchievementProps) {
  return (
    <Button
      variant="tertiary"
      size="tall"
      className="grow"
      disabled={disabled}
      onClick={onClick}
    >
      <XIcon size="sm" />
    </Button>
  );
}

export default ShareAchievement;
