import { ReactNode } from "react";
import {
  Button,
  AddUserIcon,
  Thumbnail,
  XIcon,
  CheckIcon,
  ChatIcon,
} from "@cartridge/ui";
import { useSocialClaim } from "@/hooks/starterpack/social";
import { ErrorAlert } from "@/components/ErrorAlert";
import { SocialClaimOptions } from "@cartridge/controller";
import { SocialClaimConditions } from "@/hooks/starterpack/onchain";

interface SocialClaimCheckoutProps {
  options: SocialClaimOptions;
  conditions: SocialClaimConditions;
  isFree: boolean;
  isLoading: boolean;
  handlePurchase: () => void;
}

export function SocialClaimCheckout({
  options,
  conditions,
  isFree,
  isLoading,
  handlePurchase,
}: SocialClaimCheckoutProps) {
  const {
    // connection,
    isExpired,
    connectedHandle,
    socialClaimStep,
    isLoading: isSocialLoading,
    error: socialError,
    onSocialConnect,
    onSocialFollow,
    onSocialShare,
  } = useSocialClaim(options, conditions);

  const providerName =
    conditions.provider === "TWITTER" ? "X" : conditions.provider;

  return (
    <>
      {socialError && (
        <ErrorAlert
          title="Social link error"
          description={socialError}
          variant="error"
          isExpanded
        />
      )}
      <SocialStepButton
        label={
          connectedHandle
            ? `Connected @${connectedHandle}`
            : `Connect ${providerName}`
        }
        icon={<XIcon />}
        isCurrent={socialClaimStep === "connect"}
        isCompleted={socialClaimStep !== "connect"}
        isExpired={isExpired}
      />
      <SocialStepButton
        label={`Follow @${conditions.targetAccount}`}
        icon={<AddUserIcon />}
        isCurrent={socialClaimStep === "follow"}
        isCompleted={
          socialClaimStep !== "connect" && socialClaimStep !== "follow"
        }
      />
      <SocialStepButton
        label="Spread The Word"
        icon={<ChatIcon variant="line" />}
        isCurrent={socialClaimStep === "share"}
        isCompleted={
          socialClaimStep !== "connect" &&
          socialClaimStep !== "follow" &&
          socialClaimStep !== "share"
        }
      />
      <Button
        className="w-full"
        isLoading={isLoading || isSocialLoading}
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
              ? `Follow @${conditions.targetAccount}`
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
