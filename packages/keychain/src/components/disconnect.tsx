import { useConnection } from "@/hooks/connection";
import { HeaderInner, LayoutContent } from "@cartridge/ui";
import { useEffect, useState } from "react";
import { Layout } from "./layout";

export const Disconnect = () => {
  const [isDone, setIsDone] = useState(false);
  const { controller } = useConnection();

  useEffect(() => {
    (async () => {
      if (!controller) return;
      await controller.disconnect();
      setIsDone(true);
    })();
  }, [setIsDone, controller]);

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
