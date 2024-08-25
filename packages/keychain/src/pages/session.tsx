"use client";

import { Policy } from "@cartridge/controller";
import {
  CreateController,
  CreateSession as CreateSessionComp,
} from "components/connect";

import { useConnection } from "hooks/connection";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { Call, hash } from "starknet";
import { LoginMode } from "components/connect/types";

type SessionQueryParams = Record<string, string> & {
  callback_uri: string;
};

/**
    This page is for creating session
*/
export default function CreateRemoteSession() {
  const router = useRouter();
  const queries = router.query as SessionQueryParams;

  const { controller, policies, origin } = useConnection();

  // Handler for calling the callback uri.
  // Send the session details to the callback uri in the body of the
  // POST request. If the request is successful, then redirect to the
  // success page. Else, redirect to the failure page.
  const onCallback = useCallback(() => {
    const url = decodeURIComponent(queries.callback_uri);
    const session = controller.account.sessionJson();
    if (!url || !session) {
      router.replace(`/failure`);
      return;
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    fetch(sanitizeCallbackUrl(url), {
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

  // Once we have a connected controller initialized, check if a session already exists.
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

  return controller ? (
    <CreateSessionComp onConnect={onConnect} />
  ) : (
    <CreateController loginMode={LoginMode.Controller} />
  );
}

/**
 * Sanitize the callback url to ensure that it is a valid URL. Returns back the URL.
 */
function sanitizeCallbackUrl(url: string): URL | undefined {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.endsWith("cartridge.gg") &&
      parsed.pathname !== "/" &&
      parsed.pathname !== "/callback"
    ) {
      throw new Error(`Invalid callback url: ${url}`);
    }

    return parsed;
  } catch (e) {
    console.error(e);
  }
}
