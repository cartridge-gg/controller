import { Box } from "@chakra-ui/react";
import { Banner, BannerProps } from "./Banner";
import { TopBar, TopBarProps } from "./TopBar";

export type HeaderProps = TopBarProps & BannerProps;

export function Header({ onBack, hideAccount, ...bannerProps }: HeaderProps) {
  return (
    <Box position="sticky" top={0} w="full" zIndex={1} bg="solid.bg">
      <Banner {...bannerProps} />
      <TopBar onBack={onBack} hideAccount={hideAccount} />
    </Box>
  );
}
