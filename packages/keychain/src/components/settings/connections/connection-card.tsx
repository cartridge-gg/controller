import { SettingsCard } from "@cartridge/controller-ui";
import React from "react";
import { SiInstagram, SiTiktok, SiX } from "@icons-pack/react-simple-icons";
import type {
  OAuthConnection,
  OAuthProvider,
} from "@/utils/api/oauth-connections";

export interface ConnectionCardProps {
  connection: OAuthConnection;
  onDisconnect?: () => Promise<void>;
}

export const ConnectionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ConnectionCardProps
>(({ className, connection, onDisconnect, ...props }, ref) => {
  const providerName = getProviderDisplayName(connection.provider);
  const displayName =
    connection.profile.username || connection.profile.providerUserId;
  const label = displayName ? `@${displayName}` : providerName;

  return (
    <SettingsCard
      ref={ref}
      className={className}
      icon={<ConnectionIcon provider={connection.provider} />}
      label={label}
      rightText={
        connection.isExpired ? (
          <span className="text-destructive-100">Expired</span>
        ) : undefined
      }
      onDelete={onDisconnect}
      confirm="unlink"
      confirmLabel={providerName}
      confirmSubTitle={`This will remove access to your ${providerName} account.`}
      {...props}
    />
  );
});

ConnectionCard.displayName = "ConnectionCard";

const ConnectionIcon = ({ provider }: { provider: OAuthProvider }) => {
  switch (provider) {
    case "TIKTOK":
      return <SiTiktok size={16} />;
    case "INSTAGRAM":
      return <SiInstagram size={16} />;
    case "TWITTER":
      return <SiX size={16} />;
    default:
      return null;
  }
};

const getProviderDisplayName = (provider: OAuthProvider): string => {
  switch (provider) {
    case "TIKTOK":
      return "TikTok";
    case "INSTAGRAM":
      return "Instagram";
    case "TWITTER":
      return "X";
    default:
      return provider;
  }
};
