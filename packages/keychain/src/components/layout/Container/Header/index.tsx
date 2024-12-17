import { Box } from "@chakra-ui/react";
import { Banner, BannerProps } from "./Banner";
import { TopBar, TopBarProps } from "./TopBar";

export type HeaderProps = TopBarProps & BannerProps;

export function Header({
  onBack,
  hideNetwork,
  hideAccount,
  onClose,
  ...bannerProps
}: HeaderProps & { onClose?: () => void }) {
  return (
    <Box position="sticky" top={0} w="full" zIndex={1} bg="solid.bg">
      <Banner {...bannerProps} />
      <TopBar
        onBack={onBack}
        onClose={onClose}
        hideAccount={hideAccount}
        hideNetwork={hideNetwork}
      />
    </Box>
  );
}
