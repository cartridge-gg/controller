import {
  Spacer,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { ArrowLeftIcon } from "@cartridge/ui";
import { CloseButton } from "./CloseButton";
import { HEADER_HEIGHT } from ".";
import { useController } from "hooks/controller";
import { useMemo } from "react";

export type TopBarProps = {
  onBack?: () => void;
  hideAccount?: boolean;
}

export function TopBar({ onBack, hideAccount }: TopBarProps) {
  const { controller } = useController();
  const address = useMemo(() => controller?.address, [controller]);

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
      h={HEADER_HEIGHT}
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
      ) :
        <CloseButton />
      }

      <Spacer />

      {!!address && !hideAccount && (
        <>
          {/* <NetworkButton chainId={chainId} /> */}
          {/* <EthBalance chainId={chainId} address={address} /> */}
          {/* {chainId && <AccountMenu onLogout={onLogout} address={address} />} */}
        </>
      )}
    </HStack>
  );
}
