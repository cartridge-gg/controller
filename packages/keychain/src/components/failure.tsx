import {
  LayoutContainer,
  AlertIcon,
  ExternalIcon,
  LayoutHeader,
} from "@cartridge/ui";
import { CARTRIDGE_DISCORD_LINK } from "@/const";
import { Link } from "react-router-dom";
import { useConnection } from "@/hooks/connection";

export function Failure() {
  const { closeModal, chainId } = useConnection();
  return (
    <LayoutContainer>
      <LayoutHeader
        variant="expanded"
        Icon={AlertIcon}
        title="Uh-oh something went wrong"
        description={
          <>
            If this problem persists, swing by the Cartridge support channel on{" "}
            <Link
              to={CARTRIDGE_DISCORD_LINK}
              target="_blank"
              className="inline-flex items-center gap-1 hover:underline text-accent-foreground font-semibold"
            >
              Discord
              <ExternalIcon size="sm" />
            </Link>
          </>
        }
        chainId={chainId}
        onClose={closeModal}
      />
    </LayoutContainer>
  );
}
