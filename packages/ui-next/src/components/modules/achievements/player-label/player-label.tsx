import { CopyAddress } from "@/components/copy-address";
import { SpaceInvaderIcon } from "@/components/icons";
import { cn } from "@/utils";

export interface AchievementPlayerLabelProps {
  username: string;
  address: string;
  icon?: string;
}

export const AchievementPlayerLabel = ({
  username,
  address,
  icon,
}: AchievementPlayerLabelProps) => {
  return (
    <div className="flex items-center gap-x-4">
      <div className="flex items-center justify-center w-11 h-11 rounded bg-background-200 text-foreground-100">
        {icon ? (
          <div className={cn("w-8 h-8 fa-solid", icon)} />
        ) : (
          <SpaceInvaderIcon variant="solid" size="lg" className="w-6 h-6" />
        )}
      </div>
      <div className="flex flex-col gap-y-0.5">
        <p className="text-lg/[22px] font-semibold text-foreground-100">
          {username}
        </p>
        <CopyAddress address={address} size="xs" />
      </div>
    </div>
  );
};

export default AchievementPlayerLabel;
