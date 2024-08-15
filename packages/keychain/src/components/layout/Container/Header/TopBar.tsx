import { Spacer, HStack } from "@chakra-ui/react";
import { CloseButton } from "./CloseButton";
import { NetworkButton } from "./NetworkButton";
import { SettingsButton } from "./SettingsButton";
import { useConnection } from "hooks/connection";
import { BackButton } from "./BackButton";

export type TopBarProps = {
  onBack?: () => void;
  hideAccount?: boolean;
  showSettings?: boolean;
};

export function TopBar({ onBack, hideAccount, showSettings }: TopBarProps) {
  const { context, openSettings } = useConnection();
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
          <NetworkButton />
          {/* {!!address && (
            <>
              <EthBalance chainId={chainId} address={address} />
              {chainId && <AccountMenu onLogout={onLogout} address={address} />}
            </>
          )} */}
        </>
      )}

      {showSettings && <SettingsButton onClick={() => openSettings(context)} />}
    </HStack>
  );
}

export const TOP_BAR_HEIGHT = 56;
