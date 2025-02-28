import { CopyAddress } from "#components/copy-address";
import { SpaceInvaderIcon } from "#components/icons";
import { UniversalHeaderIcon } from "../../universals/header-icon";

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
      <UniversalHeaderIcon
        icon={icon ?? <SpaceInvaderIcon variant="solid" className="w-8 h-8" />}
      />
      <div className="flex flex-col gap-y-0.5">
        <p className="text-lg/[22px] font-semibold text-foreground-100">
          {username}
        </p>
        <CopyAddress address={address} size="xs" />
      </div>
    </div>
  );
};
