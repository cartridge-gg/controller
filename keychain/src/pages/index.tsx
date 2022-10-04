import type { NextPage } from "next";
import dynamic from 'next/dynamic'
import { useEffect } from "react";

import { useRouter } from "next/router";
import { connectToParent } from '@cartridge/penpal';

import connect from "../methods/connect";
import execute from "../methods/execute";
import estimateFee from "../methods/estimate_fee";
import provision from "../methods/provision";

import Controller from "utils/account";
import { normalize as normalizeOrigin } from "utils/url";
import { Approvals } from "@cartridge/controller";

function normalize(fn: (origin: string) => Function): (origin: string) => Function {
  return (origin: string) => fn(normalizeOrigin(origin))
}

function validate(fn: (controller: Controller, approvals: Approvals, origin: string) => Function): (origin: string) => Function {
  return (origin: string) => {
    const controller = Controller.fromStore();
    if (!controller) {
      throw new Error("no controller");
    }

    const approvals = controller.approval(origin);
    if (!approvals) {
      throw new Error("not connected")
    }

    return fn(controller, approvals, origin)
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
        disconnect: normalize(validate((controller: Controller, _approvals: Approvals, origin: string) => () => controller.unapprove(origin))),
        execute: normalize(validate(execute)),
        estimateFee: normalize(validate(estimateFee)),
        provision: normalize(provision),
        probe: normalize(validate((controller: Controller, approvals: Approvals) => () => ({ address: controller.address, scopes: approvals.scopes }))),
      },
    });
  });

  return <></>;
};

export default dynamic(() => Promise.resolve(Index), { ssr: false });
