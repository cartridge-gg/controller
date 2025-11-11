import { useConnection } from "@/hooks/connection";
import { useSearchParams } from "react-router-dom";
import { StandaloneConnect } from "./StandaloneConnect";

/**
 * Wrapper component that extracts URL parameters and passes them to StandaloneConnect.
 * Used in standalone auth flow for verified presets with no custom policies.
 */
export function StandaloneConnectWrapper({ username }: { username?: string }) {
  const [searchParams] = useSearchParams();
  const { verified } = useConnection();

  const redirectUrl = searchParams.get("redirect_url");

  if (!redirectUrl) {
    console.error(
      "[Standalone Flow] StandaloneConnectWrapper: No redirect_url found in URL params",
    );
    return null;
  }

  console.log(
    "[Standalone Flow] StandaloneConnectWrapper: Rendering StandaloneConnect",
  );
  console.log(
    "[Standalone Flow] StandaloneConnectWrapper: redirectUrl =",
    redirectUrl,
  );
  console.log(
    "[Standalone Flow] StandaloneConnectWrapper: username =",
    username,
  );
  console.log(
    "[Standalone Flow] StandaloneConnectWrapper: verified =",
    verified,
  );

  return (
    <StandaloneConnect
      redirectUrl={redirectUrl}
      isVerified={verified}
      username={username}
    />
  );
}
