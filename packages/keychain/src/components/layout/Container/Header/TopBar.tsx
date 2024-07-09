import { Spacer, IconButton, HStack } from "@chakra-ui/react";
import { ArrowLeftIcon } from "@cartridge/ui";
import { CloseButton } from "./CloseButton";
import { NetworkButton } from "./NetworkButton";

export type TopBarProps = {
  onBack?: () => void;
  hideAccount?: boolean;
};

export function TopBar({ onBack, hideAccount }: TopBarProps) {
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
        <IconButton
          h={8}
          size="sm"
          aria-label="Go back"
          icon={<ArrowLeftIcon />}
          onClick={onBack}
        />
      ) : (
        <CloseButton />
      )}

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
    </HStack>
  );
}

export const TOP_BAR_HEIGHT = 56;
