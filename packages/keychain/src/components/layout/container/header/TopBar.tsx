import { Spacer, HStack } from "@chakra-ui/react";
import { CloseButton } from "./CloseButton";
import { SettingsButton } from "./SettingsButton";
import { BackButton } from "./BackButton";
import { useConnection } from "@/hooks/connection";
import { useMemo } from "react";
import { Network } from "@cartridge/ui-next";

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
      {onBack ? (
        <BackButton onClick={onBack} />
      ) : (
        <CloseButton onClose={onClose} />
      )}

      <Spacer />

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
    </HStack>
  );
}

export const TOP_BAR_HEIGHT = 56;
