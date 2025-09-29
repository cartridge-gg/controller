import { useConnection } from "@/hooks/connection";
import { HeaderInner, LayoutContent } from "@cartridge/ui";
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
          window.location.href = redirectUrl;
        }
      }
    })();
  }, [urlSearchParams, controller, isDone]);

  return (
    <Layout>
      <HeaderInner variant="expanded" title="Logout" />
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
