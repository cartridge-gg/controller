import { ReactNode } from "react";
import {
  Button,
  AddUserIcon,
  Thumbnail,
  XIcon,
  CheckIcon,
} from "@cartridge/ui";
import { OAuthProvider } from "@/utils/api/oauth-connections";
import { useSocialClaim } from "@/hooks/starterpack/social";

export function SocialClaimCheckout({
  provider,
  accountToShare,
  isFree,
  isLoading,
  handlePurchase,
}: {
  provider: OAuthProvider;
  accountToShare: string;
  isFree: boolean;
  isLoading: boolean;
  handlePurchase: () => void;
}) {
  const {
    // connection,
    socialClaimStep,
    onSocialConnect,
    onSocialFollow,
    onSocialShare,
    isExpired,
  } = useSocialClaim(provider, accountToShare);

  const providerName = provider === "TWITTER" ? "X" : provider;

  return (
    <>
      <SocialStepButton
        label={`Connect ${providerName}`}
        icon={<XIcon />}
        isCurrent={socialClaimStep === "connect"}
        isCompleted={socialClaimStep !== "connect"}
        isExpired={isExpired}
      />
      <SocialStepButton
        label={`Follow @${accountToShare}`}
        icon={<AddUserIcon />}
        isCurrent={socialClaimStep === "follow"}
        isCompleted={
          socialClaimStep !== "connect" && socialClaimStep !== "follow"
        }
      />
      <SocialStepButton
        label="Spread The Word"
        icon={<AddUserIcon />}
        isCurrent={socialClaimStep === "share"}
        isCompleted={
          socialClaimStep !== "connect" &&
          socialClaimStep !== "follow" &&
          socialClaimStep !== "share"
        }
      />
      <Button
        className="w-full"
        isLoading={isLoading}
        onClick={
          onSocialConnect ?? onSocialFollow ?? onSocialShare ?? handlePurchase
        }
        disabled={!isFree}
      >
        {!isFree
          ? "Not Implmenented"
          : socialClaimStep === "connect"
            ? `Connect ${providerName}`
            : socialClaimStep === "follow"
              ? `Follow @${accountToShare}`
              : socialClaimStep === "share"
                ? "Spread The Word"
                : "Claim"}
      </Button>
    </>
  );
}

const SocialStepButton = ({
  label,
  icon,
  isCurrent,
  isCompleted,
  isExpired,
}: {
  label: string;
  icon: ReactNode;
  isCurrent: boolean;
  isCompleted: boolean;
  isExpired?: boolean;
}) => {
  return (
    <Button
      className="w-full justify-start pointer-events-none"
      variant="secondary"
      onClick={undefined}
      disabled={!isCurrent}
    >
      <div className="flex gap-2 w-full">
        <Thumbnail
          className={!isCurrent ? "text-foreground-400" : ""}
          icon={isCompleted ? <CheckIcon className="w-4 h-4" /> : icon}
          variant="light"
          size="sm"
          rounded
        />
        <div className="flex-grow text-left">{label}</div>
        {isExpired && <div className="text-destructive">Expired</div>}
      </div>
    </Button>
  );
};
