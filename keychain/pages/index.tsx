import type { NextPage } from "next";
import { useEffect } from "react";
import cuid from "cuid";

import { Messenger, Message, Request } from "@cartridge/controller";

import { onSDKMessage } from "core";

const Index: NextPage = () => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const messenger = new Messenger(undefined, process.env.TARGET_ORIGIN);
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
      { targetOrigin: process.env.TARGET_ORIGIN },
    );
  });

  return <></>;
};

export default Index;
