"use client";

import { Policy } from "@cartridge/controller";
import Controller from "utils/controller";
import { CreateSession as CreateSessionComp } from "components/connect";

import { fetchAccount } from "components/connect/utils";
import { useConnection } from "hooks/connection";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { PageLoading } from "components/Loading";
import { Call, hash } from "starknet";

type SessionQueryParams = Record<string, string> & {
  callback_uri: string;
  username: string;
};

/**
    This page is for creating session
*/
export default function CreateRemoteSession() {
  const router = useRouter();
  const queries = router.query as SessionQueryParams;

  const { controller, setController, policies, origin, chainId, rpcUrl } =
    useConnection();

  // Fetching account status for displaying the loading screen
  const [isFetching, setIsFetching] = useState(true);

  // Handler for calling the callback uri.
  // Send the session details to the callback uri in the body of the
  // POST request. If the request is successful, then redirect to the
  // success page. Else, redirect to the failure page.
  const onCallback = useCallback(() => {
    const url = new URL(decodeURIComponent(queries.callback_uri));
    const session = controller.account.sessionJson();
    if (!url || !session) {
      router.replace(`/failure`);
      return;
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    fetch(url, {
      body: JSON.stringify({
        username: controller.username,
        credentials: {
          publicKey: controller.publicKey,
          credentialId: controller.credentialId,
        },
        session,
      }),
      headers,
      method: "POST",
    })
      .then(async (res) => {
        if (res.ok) {
          return router.replace({
            pathname: "/success",
            query: {
              title: "Seession Created!",
              description: "Return to your terminal to continue",
            },
          });
        }

        Promise.reject();
      })
      .catch((e) => {
        console.error("failed to call the callback url", e);
        router.replace(`/failure`);
      });
  }, [router, queries.callback_uri, controller]);

  // Handler when user clicks the Create button
  const onConnect = useCallback(
    (_: Policy[]) => {
      if (!controller.account.sessionJson()) {
        throw new Error("Session not found");
      }

      if (!queries.callback_uri) {
        throw new Error("Callback URI is missing");
      }

      onCallback();
    },
    [queries.callback_uri, controller, onCallback],
  );

  // Fetch account details from the username, and create the Controller
  useEffect(() => {
    const username = queries.username;

    if (!username || !chainId || !rpcUrl) {
      return;
    }

    fetchAccount(username)
      .then((res) => {
        const {
          account: {
            credentials: {
              webauthn: [{ id: credentialId, publicKey }],
            },
            contractAddress: address,
          },
        } = res;

        const controller = new Controller({
          appId: origin,
          chainId,
          rpcUrl,
          address,
          username,
          publicKey,
          credentialId,
        });

        setController(controller);
      })
      .catch((e) => console.error(e))
      .finally(() => setIsFetching(false));
  }, [rpcUrl, chainId, origin, setController, queries.username]);

  // Once the controller is created upon start, check if a session already exists.
  // If yes, check if the policies of the session are the same as the ones that are
  // currently being requested. Return existing session to the callback uri if policies match.
  useEffect(() => {
    if (!controller || !origin) {
      return;
    }

    let calls = policies.map((policy) => {
      return {
        contractAddress: policy.target,
        entrypoint: hash.getSelector(policy.method),
        calldata: [],
      } as Call;
    });

    // if the requested policies has no mismatch with existing policies then return
    // the exising session
    if (controller.account.hasSession(calls)) {
      onCallback();
    }
  }, [controller, origin, policies, onCallback]);

  // Show loader if currently fetching account
  if (isFetching) {
    return <PageLoading />;
  }

  return <CreateSessionComp onConnect={onConnect} />;
}
