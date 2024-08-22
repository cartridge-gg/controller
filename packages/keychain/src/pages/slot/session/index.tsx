import { Policy } from "@cartridge/controller";
import Controller from "utils/controller";
import { CreateSession as CreateSessionComp } from "components/connect";

import { fetchAccount } from "components/connect/utils";
import { useConnection } from "hooks/connection";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { PageLoading } from "components/Loading";
import dynamic from "next/dynamic";
import { Call, hash } from "starknet";

type SessionQueryParams = Record<string, string> & {
  callback_uri: string;
  username: string;
};

/**
    This page is for creating session with Slot
*/
function CreateSession() {
  const router = useRouter();
  const queries = router.query as SessionQueryParams;

  const { controller, setController, policies, origin, chainId, rpcUrl } =
    useConnection();

  // Fetching account status for displaying the loading screen
  const [isFetching, setIsFetching] = useState(true);

  // Handler for calling the Slot callback uri.
  // Send the session details to the callback uri in the body of the
  // POST request. If the request is successful, then redirect to the
  // success page. Else, redirect to the failure page.
  const onSlotCallback = useCallback(() => {
    const url = sanitizeCallbackUrl(decodeURIComponent(queries.callback_uri));
    const session = controller.account.sessionJson();
    if (!url || !session) {
      router.replace(`/slot/auth/failure`);
      return;
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    fetch(url, {
      body: JSON.stringify(session),
      headers,
      method: "POST",
    })
      .then(async (res) => {
        return res.status === 200
          ? router.replace(`/slot/auth/success`)
          : new Promise((_, reject) => reject(res));
      })
      .catch((e) => {
        console.error("failed to call the callback url", e);
        router.replace(`/slot/auth/failure`);
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

      onSlotCallback();
    },
    [queries.callback_uri, controller, onSlotCallback],
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
            // @ts-expect-error TODO(#602): Fix type
            credentials: {
              webauthn: [{ id: credentialId, publicKey }],
            },
            // @ts-expect-error TODO(#602): Fix type
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
        // @ts-expect-error TODO(#602): Fix type
        entrypoint: hash.getSelector(policy.method),
        calldata: [],
      } as Call;
    });

    // if the requested policies has no mismatch with existing policies then return
    // the exising session
    if (controller.account.hasSession(calls)) {
      onSlotCallback();
    }
  }, [controller, origin, policies, onSlotCallback]);

  // Show loader if currently fetching account
  if (isFetching) {
    return <PageLoading />;
  }

  return <CreateSessionComp onConnect={onConnect} />;
}

/**
 * Sanitize the callback url to ensure that it is a valid URL. Returns back the URL.
 */
function sanitizeCallbackUrl(url: string): URL | undefined {
  try {
    const parsed = new URL(url);

    if (parsed.hostname !== "localhost" || parsed.pathname !== "/callback") {
      throw new Error(`Invalid callback url: ${url}`);
    }

    return parsed;
  } catch (e) {
    console.error(e);
  }
}

export default dynamic(() => Promise.resolve(CreateSession), { ssr: false });
