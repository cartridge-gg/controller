import type { NextPage } from "next";
import dynamic from 'next/dynamic'
import { useEffect } from "react";

import { useRouter } from "next/router";
import { connectToParent } from '@cartridge/penpal';

import connect from "../methods/connect";
import execute from "../methods/execute";
import estimateFee from "../methods/estimate_fee";
import register from "../methods/register";

import Controller from "utils/account";

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
        connect,
        execute,
        estimateFee,
        register,
        probe: (origin: string) => async () => {
          const controller = Controller.fromStore();
          if (!controller) {
            throw new Error("no controller");
          }

          const approvals = await controller.approval(origin);
          if (!controller || !approvals) {
            throw new Error("not connected")
          }

          return { address: controller.address, scopes: approvals.scopes };
        },
      },
    });
  });

  return <></>;
};

export default dynamic(() => Promise.resolve(Index), { ssr: false });
