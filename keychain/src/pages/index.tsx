import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useEffect } from "react";

import { useRouter } from "next/router";
import { connectToParent } from "@cartridge/penpal";

import connect from "../methods/connect";
import execute from "../methods/execute";
import { estimateDeclareFee, estimateInvokeFee } from "../methods/estimate";
import provision from "../methods/provision";
import register from "../methods/register";
import login from "../methods/login";
import logout from "../methods/logout";
import { signMessage } from "../methods/sign";
import { revoke, session, sessions } from "../methods/sessions";

import Controller from "utils/account";
import { normalize as normalizeOrigin } from "utils/url";
import { Session } from "@cartridge/controller";

function normalize(
  fn: (origin: string) => Function,
): (origin: string) => Function {
  return (origin: string) => fn(normalizeOrigin(origin));
}

function validate(
  fn: (controller: Controller, session: Session, origin: string) => Function,
): (origin: string) => Function {
  return (origin: string) => {
    const controller = Controller.fromStore();
    if (!controller) {
      throw new Error("no controller");
    }

    const session = controller.session(origin);
    if (!session) {
      throw new Error("not connected");
    }

    return fn(controller, session, origin);
  };
}

const Index: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.self === window.top) {
      router.replace(`${process.env.NEXT_PUBLIC_SITE_URL}/welcome`);
      return;
    }

    const connection = connectToParent({
      methods: {
        connect: normalize(connect),
        disconnect: normalize(
          validate(
            (controller: Controller, _session: Session, origin: string) => () =>
              controller.revoke(origin),
          ),
        ),
        execute: normalize(validate(execute)),
        estimateDeclareFee: normalize(validate(estimateDeclareFee)),
        estimateInvokeFee: normalize(validate(estimateInvokeFee)),
        provision: normalize(provision),
        register: normalize(register),
        login: normalize(login),
        logout: normalize(logout),
        probe: normalize(
          validate((controller: Controller, session: Session) => () => ({
            address: controller.address,
            policies: session.policies,
          })),
        ),
        revoke: normalize(revoke),
        signMessage: normalize(validate(signMessage)),
        session: normalize(session),
        sessions: normalize(sessions),
      },
    });

    return () => {
      connection.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};

export default dynamic(() => Promise.resolve(Index), { ssr: false });
