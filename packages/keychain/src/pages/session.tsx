"use client";

import {
  CreateController,
  CreateSession,
  RegisterSession,
} from "components/connect";

import { useConnection } from "hooks/connection";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LoginMode } from "components/connect/types";
import { SESSION_EXPIRATION } from "const";
import { PageLoading } from "components/Loading";

type SessionResponse = {
  username: string;
  address: string;
  expiresAt: string;
  ownerGuid: string;
  transactionHash?: string;
  alreadyRegistered?: boolean;
};

type SessionQueryParams = Record<string, string> & {
  public_key: string;
  callback_uri?: string;
  redirect_uri?: string;
  redirect_query_name?: string;
};

/**
    This page is for registering session
*/
export default function Session() {
  const router = useRouter();
  const queries = router.query as SessionQueryParams;

  const { controller, policies, origin } = useConnection();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Handler for calling the callback uri.
  // Send the session details to the callback uri in the body of the
  // POST request. If the request is successful, then redirect to the
  // success page. Else, redirect to the failure page.
  const onCallback = useCallback(
    async (response: SessionResponse) => {
      if (!queries.callback_uri && !queries.redirect_uri) {
        router.replace(`/failure`);
        return;
      }

      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      // Remove any trailing '=' characters from the encoded response
      // Telegram doesnt seem to be able to decode the response if there are any
      const encodedResponse = btoa(JSON.stringify(response)).replace(/=+$/, "");

      if (queries.callback_uri) {
        try {
          const url = sanitizeCallbackUrl(
            decodeURIComponent(queries.callback_uri),
          );
          if (!url) return;
          const res = await fetch(url, {
            body: encodedResponse,
            headers,
            method: "POST",
          });

          if (res.ok) {
            return router.replace({
              pathname: "/success",
              query: {
                title: "Session Registered!",
                description: "Return to your terminal to continue",
              },
            });
          }
        } catch (e) {
          console.error("failed to call the callback url", e);
          router.replace(`/failure`);
        }

        return;
      }

      if (queries.redirect_uri) {
        const url = decodeURIComponent(queries.redirect_uri);
        const query_name = queries.redirect_query_name ?? "session";
        router.replace(`${url}?${query_name}=${encodedResponse}`);
      }
    },
    [router, queries],
  );

  // Handler when user clicks the Create button
  const onConnect = useCallback(
    async (transaction_hash?: string) => {
      if (!queries.callback_uri && !queries.redirect_uri) {
        throw new Error("Expected either callback_uri or redirect_uri");
      }

      if (!controller) return;

      onCallback({
        username: controller.username(),
        address: controller.address,
        ownerGuid: controller.cartridge.ownerGuid(),
        transactionHash: transaction_hash,
        expiresAt: String(SESSION_EXPIRATION),
      });
    },
    [queries.callback_uri, queries.redirect_uri, controller, onCallback],
  );

  // Once we have a connected controller initialized, check if a session already exists.
  // If yes, check if the policies of the session are the same as the ones that are
  // currently being requested. Return existing session to the callback uri if policies match.
  useEffect(() => {
    if (!controller || !origin) {
      return;
    }

    // If the requested policies has no mismatch with existing policies and public key already
    // registered then return the exising session
    if (controller.session(policies, queries.public_key)) {
      onCallback({
        username: controller.username(),
        address: controller.address,
        ownerGuid: controller.cartridge.ownerGuid(),
        alreadyRegistered: true,
        expiresAt: String(SESSION_EXPIRATION),
      });

      return;
    }

    setIsLoading(false);
  }, [controller, origin, policies, queries.public_key, onCallback]);

  if (!controller) {
    return <CreateController loginMode={LoginMode.Controller} />;
  }

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <>
      {queries.public_key ? (
        <RegisterSession onConnect={onConnect} publicKey={queries.public_key} />
      ) : (
        <CreateSession onConnect={onConnect} />
      )}
    </>
  );
}

/**
 * Sanitize the callback url to ensure that it is a valid URL. Returns back the URL.
 */
function sanitizeCallbackUrl(url: string): URL | undefined {
  try {
    const parsed = new URL(url);
    const allowedHostnames = ["localhost"];
    const allowedPaths = ["/callback"];

    if (
      !allowedHostnames.includes(parsed.hostname) ||
      !allowedPaths.includes(parsed.pathname)
    ) {
      throw new Error(`Invalid callback url: ${url}`);
    }

    return parsed;
  } catch (e) {
    console.error(e);
  }
}
