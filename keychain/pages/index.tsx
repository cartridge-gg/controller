import type { NextPage } from "next";
import { useEffect } from "react";
import { Messenger, Message, Request } from "@cartridge/controller";
import cuid from "cuid";
import { onSDKMessage } from "core/sdk";
import { BroadcastChannel, createLeaderElection } from "broadcast-channel";

const Index: NextPage = () => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const channel = new BroadcastChannel("cartridge-controller");
    const elector = createLeaderElection(channel);

    elector.awaitLeadership().then(() => {
      const messenger = new Messenger(undefined, "*");
      messenger.onRequest((msg, reply) => {
        const id = cuid();
        onSDKMessage({
          id,
          payload: msg,
        } as Message<Request>).then(reply);
      });

      window.parent.postMessage(
        {
          target: "cartridge",
          type: "broadcast",
          payload: {
            method: "ready",
          },
        },
        { targetOrigin: "*" },
      );
    });
  }, []);

  return <></>;
};

export default Index;
