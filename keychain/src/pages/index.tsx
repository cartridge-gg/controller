import type { NextPage } from "next";
import dynamic from 'next/dynamic'
import { useEffect } from "react";

import { useRouter } from "next/router";
import { connectToParent } from '@cartridge/penpal';

import connect from "../methods/connect";
import execute from "../methods/execute";
import estimateFee from "../methods/estimate_fee";
import provision from "../methods/provision";
import register from "../methods/register";
import { revoke, session, sessions } from "../methods/sessions";

import Controller from "utils/account";
import { normalize as normalizeOrigin } from "utils/url";
import { Session } from "@cartridge/controller";

function normalize(fn: (origin: string) => Function): (origin: string) => Function {
  return (origin: string) => fn(normalizeOrigin(origin))
}

function validate(fn: (controller: Controller, session: Session, origin: string) => Function): (origin: string) => Function {
  return (origin: string) => {
    const controller = Controller.fromStore();
    if (!controller) {
      throw new Error("no controller");
    }

    const session = controller.session(origin);
    if (!session) {
      throw new Error("not connected")
    }

    return fn(controller, session, origin)
  }
}

const Index: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.self === window.top) {
      router.replace("/welcome");
      return;
    }

    connectToParent({
      debug: true,
      methods: {
        connect: normalize(connect),
        disconnect: normalize(validate((controller: Controller, _session: Session, origin: string) => () => controller.revoke(origin))),
        execute: normalize(validate(execute)),
        estimateFee: normalize(validate(estimateFee)),
        provision: normalize(provision),
        register: normalize(register),
        probe: normalize(validate((controller: Controller, session: Session) => () => ({ address: controller.address, policies: session.policies }))),
        revoke: normalize(revoke),
        session: normalize(session),
        sessions: normalize(sessions),
      },
    });
  });

  return <></>;
};

export default dynamic(() => Promise.resolve(Index), { ssr: false });
