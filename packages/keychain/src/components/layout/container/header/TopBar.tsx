import { CloseButton } from "./CloseButton";
import { SettingsButton } from "./SettingsButton";
import { BackButton } from "./BackButton";
import { useConnection } from "@/hooks/connection";
import { useMemo } from "react";
import { Network } from "@cartridge/ui";

export type TopBarProps = {
  onBack?: () => void;
  hideAccount?: boolean;
  hideNetwork?: boolean;
  onClose?: () => void;
};

export function TopBar({
  onBack,
  hideAccount,
  hideNetwork,
  onClose,
}: TopBarProps) {
  const { openSettings, context, chainId } = useConnection();
  const showSettings = useMemo(
    () => !context || !["connect", "open-settings"].includes(context.type),
    [context],
  );

  return (
    <div className="flex items-center justify-between absolute top-0 left-0 right-0 h-14 p-2 z-50">
      <div>
        {onBack ? (
          <BackButton onClick={onBack} />
        ) : (
          <CloseButton onClose={onClose} />
        )}
      </div>

      <div className="flex items-center gap-2">
        {!hideNetwork && chainId && <Network chainId={chainId} />}

        {!hideAccount && (
          <>
            {/* {!!address && (
            <>
              <EthBalance chainId={chainId} address={address} />
              {chainId && <AccountMenu onLogout={onLogout} address={address} />}
            </>
          )} */}
          </>
        )}

        {showSettings && <SettingsButton onClick={() => openSettings()} />}
      </div>
    </div>
  );
}
