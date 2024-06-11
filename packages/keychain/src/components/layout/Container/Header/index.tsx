import React, { useMemo } from "react";
import {
  Spacer,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { ArrowLeftIcon, TimesIcon } from "@cartridge/ui";
// import { NetworkButton } from "./NetworkButton";
// import { EthBalance } from "./EthBalance";
// import { AccountMenu } from "./AccountMenu";
import { useController } from "hooks/controller";
import { useConnection } from "hooks/connection";
import { isIframe } from "components/connect/utils";

export type HeaderProps = {
  onLogout?: () => void;
  onBack?: () => void;
  hideAccount?: boolean;
};

export function Header({
  // onLogout,
  onBack,
  hideAccount,
}: HeaderProps) {
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
      position="fixed"
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

function CloseButton() {
  const { close } = useConnection();

  if (!isIframe()) {
    return null
  }

  return (
    <IconButton
      aria-label="Close Keychain"
      bg="solid.bg"
      _hover={{
        bg: "solid.bg",
        opacity: 0.75
      }}
      icon={< TimesIcon fontSize={24} />}
      onClick={close}
    />
  );
}


export const TOP_OFFSET = 64;
export const HEADER_HEIGHT = 14
