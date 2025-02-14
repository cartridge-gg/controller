import { Button, XIcon } from "@/index";

interface AchievementShareProps {
  disabled?: boolean;
  onClick?: () => void;
}

export function AchievementShare({ disabled, onClick }: AchievementShareProps) {
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

export default AchievementShare;
