import {
  Button,
  AddUserIcon,
  XIcon,
  ChatIcon,
  SocialCard,
} from "@cartridge/controller-ui";
import { useSocialClaim } from "@/hooks/starterpack/social";
import { ErrorAlert } from "@/components/ErrorAlert";
import { SocialClaimOptions } from "@cartridge/controller";
import { SocialClaimConditions } from "@/hooks/starterpack/bundle";

interface SocialClaimCheckoutProps {
  bundleId: number;
  options: SocialClaimOptions | undefined;
  conditions: SocialClaimConditions;
  isFree: boolean | undefined;
  isLoading: boolean;
  handlePurchase: () => void;
}

export function SocialClaimCheckout({
  bundleId,
  options,
  conditions,
  isFree,
  isLoading,
  handlePurchase,
}: SocialClaimCheckoutProps) {
  const {
    isExpired,
    connectedHandle,
    socialClaimStep,
    isLoading: isSocialLoading,
    error: socialError,
    onSocialConnect,
    onSocialFollow,
    onSocialShare,
  } = useSocialClaim(bundleId, options, conditions);

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
      <div className="flex flex-col gap-[1px]">
        <SocialCard
          text={`Connect ${providerName}`}
          handle={connectedHandle ? `@${connectedHandle}` : undefined}
          icon={<XIcon />}
          isDisabled={socialClaimStep !== "connect"}
          isCompleted={socialClaimStep !== "connect"}
          isExpired={isExpired}
          onClick={onSocialConnect}
        />
        <SocialCard
          text={`Follow`}
          handle={`@${conditions.targetAccount}`}
          icon={<AddUserIcon />}
          isDisabled={socialClaimStep !== "follow"}
          isCompleted={
            socialClaimStep !== "connect" && socialClaimStep !== "follow"
          }
          onClick={onSocialFollow}
        />
        <SocialCard
          text="Spread The Word"
          icon={<ChatIcon variant="line" />}
          isDisabled={socialClaimStep !== "share"}
          isCompleted={
            socialClaimStep !== "connect" &&
            socialClaimStep !== "follow" &&
            socialClaimStep !== "share"
          }
          onClick={onSocialShare}
        />
      </div>
      <Button
        className="w-full"
        isLoading={isLoading || isSocialLoading}
        onClick={
          onSocialConnect ?? onSocialFollow ?? onSocialShare ?? handlePurchase
        }
        disabled={isFree === false}
      >
        {isFree === false
          ? "Paid Not Implemented"
          : socialClaimStep === "connect"
            ? `Connect ${providerName}`
            : socialClaimStep === "follow"
              ? "Follow"
              : socialClaimStep === "share"
                ? "Spread The Word"
                : "Claim"}
      </Button>
    </>
  );
}
