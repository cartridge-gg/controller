import type { NextPage } from "next";
import { useEffect } from "react";
import cuid from "cuid";
import { BroadcastChannel, createLeaderElection } from "broadcast-channel";

import { Messenger, Message, Request } from "@cartridge/controller";

import { onSDKMessage } from "src";

const Index: NextPage = () => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
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
