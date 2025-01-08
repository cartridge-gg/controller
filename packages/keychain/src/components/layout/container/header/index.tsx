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
    <div className="sticky top-0 w-full z-[1] bg-background">
      <Banner {...bannerProps} />
      <TopBar
        onBack={onBack}
        onClose={onClose}
        hideAccount={hideAccount}
        hideNetwork={hideNetwork}
      />
    </div>
  );
}
