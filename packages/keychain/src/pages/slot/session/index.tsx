import { Policy, Session } from "@cartridge/controller";
import { LoadingLogo } from "components";
import { NextPage } from "next";
import Controller from "utils/controller";
import { CreateSession } from "components/connect";

import { diff } from "utils/controller";
import { fetchAccount } from "components/connect/utils";
import { useConnection } from "hooks/connection";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

type SessionQueryParams = Record<string, string> & {
  callback_uri: string;
  username: string;
};

/**
    This page is for creating session with Slot
*/
const CreateSessionPage: NextPage = () => {
  const router = useRouter();
  const queries = router.query as SessionQueryParams;

  const { controller, setController, policies, origin, chainId, rpcUrl } =
    useConnection();

  // Fetching account status for displaying the loading screen
  const [isFetching, setIsFetching] = useState(false);

  // Handler for calling the Slot callback uri.
  // Send the session details to the callback uri in the body of the
  // POST request. If the request is successful, then redirect to the
  // success page. Else, redirect to the failure page.
  const onSlotCallback = useCallback(
    (session: Session) => {
      const url = decodeURIComponent(queries.callback_uri);
      const body = JSON.stringify(session);
      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      fetch(url, {
        body,
        headers,
        method: "POST",
      })
        .then((res) => {
          res.status === 200
            ? router.replace(`/slot/auth/success`)
            : new Promise((_, reject) => reject(res));
        })
        .catch((e) => {
          console.error("failed to call the callback url", e);
          router.replace(`/slot/auth/failure`);
        });
    },
    [router, queries.callback_uri],
  );

  // Handler when user clicks the Create button
  const onConnect = useCallback(
    (_: Policy[]) => {
      const session = controller.session(origin);

      if (!session) {
        throw new Error("Session not found");
      }

      if (!queries.callback_uri) {
        throw new Error("Callback URI is missing");
      }

      onSlotCallback(session);
    },
    [queries.callback_uri, origin, controller, onSlotCallback],
  );

  // Fetch account details from the username, and create the Controller
  useEffect(() => {
    const username = queries.username;

    if (isFetching) {
      return;
    }

    if (!username || !chainId || !rpcUrl || controller) {
      return;
    }

    setIsFetching(true);
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
  }, [
    rpcUrl,
    chainId,
    controller,
    isFetching,
    setController,
    queries.username,
  ]);

  // Once the controller is created upon start, check if a session already exists.
  // If yes, check if the policies of the session are the same as the ones that are
  // currently being requested. Return existing session to the callback uri if policies match.
  useEffect(() => {
    if (!controller || !origin) {
      return;
    }

    const session = controller.session(origin);

    // if the requested policies has no mismatch with existing policies then return
    // the exising session
    if (session && diff(policies, session.policies).length === 0) {
      onSlotCallback(session);
    }
  }, [controller, origin, policies, onSlotCallback]);

  // Show loader if currently fetching account
  if (isFetching || !controller) {
    return <LoadingLogo />;
  }

  return <CreateSession onConnect={onConnect} />;
};

export default CreateSessionPage;
