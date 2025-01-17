import { Container } from "@/components/layout";
import { AlertIcon, ExternalIcon } from "@cartridge/ui-next";
import { CARTRIDGE_DISCORD_LINK } from "@/const";
import { Link } from "react-router-dom";

export function Failure() {
  return (
    <Container
      variant="expanded"
      hideAccount
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
    />
  );
}
