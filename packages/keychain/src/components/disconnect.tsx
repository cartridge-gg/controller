import { useConnection } from "@/hooks/connection";
import { safeStandaloneRedirect } from "@/utils/url-validator";
import { HeaderInner, LayoutContent } from "@cartridge/controller-ui";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "./layout";

export const Disconnect = () => {
  const [urlSearchParams] = useSearchParams();
  const [isDone, setIsDone] = useState(false);
  const { controller } = useConnection();

  useEffect(() => {
    (async () => {
      if (!controller || isDone) return;
      await controller.disconnect();
      setIsDone(true);
      if (urlSearchParams) {
        const redirectUrl = urlSearchParams.get("redirect_url");
        if (redirectUrl) {
          // Validate the target (native custom schemes allowed, dangerous
          // script schemes blocked) and append the logout signal so the app
          // clears its local session state on return.
          safeStandaloneRedirect(redirectUrl, { logout: true });
        }
      }
    })();
  }, [urlSearchParams, controller, isDone]);

  return (
    <Layout>
      <HeaderInner variant="expanded" title="Log Out" />
      <LayoutContent className="gap-6">
        {isDone ? (
          <div>
            You've been successfully logged out, you can now close this page
          </div>
        ) : (
          <div>Logging out...</div>
        )}
      </LayoutContent>
    </Layout>
  );
};
