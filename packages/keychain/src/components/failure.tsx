import { AlertIcon, ExternalIcon, HeaderInner } from "@cartridge/ui";
import { CARTRIDGE_DISCORD_LINK } from "@/constants";
import { Link } from "react-router-dom";

export function Failure() {
  return (
    <HeaderInner
      variant="expanded"
      Icon={AlertIcon}
      title="Uh-oh something went wrong"
      hideIcon
      description={
        <>
          If this problem persists, swing by the Cartridge support channel on{" "}
          <Link
            to={CARTRIDGE_DISCORD_LINK}
            target="_blank"
            className="inline-flex items-center gap-1 hover:underline text-foreground-200 font-semibold"
          >
            Discord
            <ExternalIcon size="sm" />
          </Link>
        </>
      }
    />
  );
}
