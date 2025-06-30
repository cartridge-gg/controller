import {
  LayoutContainer,
  AlertIcon,
  ExternalIcon,
  LayoutHeader,
  LayoutContent,
} from "@cartridge/ui";
import { CARTRIDGE_DISCORD_LINK } from "@/const";
import { Link, useSearchParams } from "react-router-dom";

export function Failure() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const isOAuthError =
    error &&
    (error.includes("oauth") ||
      error === "access_denied" ||
      error === "invalid_request");

  return (
    <LayoutContainer>
      <LayoutHeader
        variant="expanded"
        Icon={AlertIcon}
        title={
          isOAuthError ? "Authentication Failed" : "Uh-oh something went wrong"
        }
        description={
          <>
            {isOAuthError ? (
              "There was a problem with the authentication process."
            ) : (
              <>
                If this problem persists, swing by the Cartridge support channel
                on{" "}
                <Link
                  to={CARTRIDGE_DISCORD_LINK}
                  target="_blank"
                  className="inline-flex items-center gap-1 hover:underline text-foreground-200 font-semibold"
                >
                  Discord
                  <ExternalIcon size="sm" />
                </Link>
              </>
            )}
          </>
        }
        hideNetwork
      />

      {isOAuthError && (
        <LayoutContent className="gap-4">
          <div className="flex w-full px-4 py-5 bg-background-200 border border-background-300 rounded">
            <p className="w-full text-sm">
              <strong>Authentication Error:</strong> {errorDescription || error}
              <br />
              <br />
              Please return to the terminal and try authenticating again. If the
              problem persists, swing by the Cartridge support channel on{" "}
              <Link
                to={CARTRIDGE_DISCORD_LINK}
                target="_blank"
                className="inline-flex items-center gap-1 hover:underline text-foreground-200 font-semibold"
              >
                Discord
                <ExternalIcon size="sm" />
              </Link>
            </p>
          </div>
        </LayoutContent>
      )}
    </LayoutContainer>
  );
}
