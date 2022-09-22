import type { NextPage } from "next";
import { useEffect } from "react";
import cuid from "cuid";

import { Messenger, Message, Request } from "@cartridge/controller";

import { onSDKMessage } from "../handlers";
import { useRouter } from "next/router";

const Index: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.self !== window.top) {
      router.replace("/welcome");
      return;
    }

    const messenger = new Messenger(null, "*");
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

  return <></>;
};

export default Index;
