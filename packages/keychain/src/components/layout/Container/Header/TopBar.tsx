import { Spacer, HStack } from "@chakra-ui/react";
import { CloseButton } from "./CloseButton";
import { NetworkStatus } from "./NetworkStatus";
import { SettingsButton } from "./SettingsButton";
import { BackButton } from "./BackButton";
import { useConnection } from "hooks/connection";

export type TopBarProps = {
  onBack?: () => void;
  hideAccount?: boolean;
  showSettings?: boolean;
};

export function TopBar({ onBack, hideAccount, showSettings }: TopBarProps) {
  const { openSettings } = useConnection();
  return (
    <HStack
      w="full"
      zIndex="overlay"
      align="center"
      justify="flex-start"
      flexShrink={0}
      bg="transparent"
      position="absolute"
      top={0}
      h={TOP_BAR_HEIGHT / 4}
      p={2}
    >
      {onBack ? <BackButton onClick={onBack} /> : <CloseButton />}

      <Spacer />

      {!hideAccount && (
        <>
          <NetworkStatus />
          {/* {!!address && (
            <>
              <EthBalance chainId={chainId} address={address} />
              {chainId && <AccountMenu onLogout={onLogout} address={address} />}
            </>
          )} */}
        </>
      )}

      {showSettings && <SettingsButton onClick={() => openSettings()} />}
    </HStack>
  );
}

export const TOP_BAR_HEIGHT = 56;
