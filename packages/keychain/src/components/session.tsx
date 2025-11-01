"use client";

import {
  CreateController,
  CreateSession,
  RegisterSession,
} from "@/components/connect";

import { useConnection } from "@/hooks/connection";
import { CheckIcon, HeaderInner } from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Failure } from "./failure";

type SessionResponse = {
  username: string;
  address: string;
  ownerGuid: string;
  expiresAt: string;
  transactionHash?: string;
  alreadyRegistered?: boolean;
};

type SessionQueryParams = {
  public_key: string;
  callback_uri: string | null;
  redirect_uri: string | null;
  redirect_query_name: string | null;
};

/**
    This page is for registering session
*/
export function Session() {
  const [searchParams] = useSearchParams();
  const queries: SessionQueryParams = useMemo(
    () => ({
      public_key: searchParams.get("public_key")!,
      callback_uri: searchParams.get("callback_uri"),
      redirect_uri: searchParams.get("redirect_uri"),
      redirect_query_name: searchParams.get("redirect_query_name"),
    }),
    [searchParams],
  );

  const { controller, policies } = useConnection();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isFailure, setIsFailure] = useState<boolean>(false);

  const hasExternalTarget = Boolean(
    queries.callback_uri || queries.redirect_uri,
  );

  const markCompleted = useCallback(() => {
    setIsFailure(false);
    setIsSuccess(true);
    setIsLoading(false);
  }, []);

  // Handler for calling the callback uri.
  // Send the session details to the callback uri in the body of the
  // POST request. If the request is successful, then redirect to the
  // success page. Else, redirect to the failure page.
  const onCallback = useCallback(
    async (response: SessionResponse) => {
      if (!queries.callback_uri && !queries.redirect_uri) {
        markCompleted();
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
          if (!url) {
            return;
          }

          const res = await fetch(url, {
            body: encodedResponse,
            headers,
            method: "POST",
          });

          if (res.ok) {
            markCompleted();
            return;
          }
        } catch (e) {
          console.error("failed to call the callback url", e);
          setIsFailure(true);
          setIsLoading(false);
        }

        return;
      }

      if (queries.redirect_uri) {
        const url = decodeURIComponent(queries.redirect_uri);
        const query_name = queries.redirect_query_name ?? "session";
        window.location.href = `${url}?${query_name}=${encodedResponse}`;
        return;
      }
    },
    [queries, markCompleted],
  );

  // Handler when user clicks the Create button
  const onConnect = useCallback(
    async (transaction_hash?: string, expiresAt?: bigint) => {
      if (!hasExternalTarget) {
        markCompleted();
        return;
      }

      if (!controller) return;

      onCallback({
        username: controller.username(),
        address: controller.address(),
        ownerGuid: await controller.ownerGuid(),
        transactionHash: transaction_hash,
        expiresAt: String(expiresAt),
      });
    },
    [controller, hasExternalTarget, markCompleted, onCallback],
  );

  // Once we have a connected controller initialized, check if a session already exists.
  // If yes, check if the policies of the session are the same as the ones that are
  // currently being requested. Return existing session to the callback uri if policies match.
  useEffect(() => {
    if (!controller || !policies) {
      return;
    }

    // If the requested policies has no mismatch with existing policies and public key already
    // registered then return the exising session
    controller
      .isRegisteredSessionAuthorized(policies, queries.public_key)
      .then((session) => {
        if (session) {
          if (!hasExternalTarget) {
            markCompleted();
            return;
          }

          onCallback({
            username: controller.username(),
            address: controller.address(),
            ownerGuid: controller.ownerGuid(),
            alreadyRegistered: true,
            expiresAt: String(session.session.expiresAt),
          });

          return;
        }

        setIsLoading(false);
      });
  }, [
    controller,
    policies,
    queries.public_key,
    hasExternalTarget,
    markCompleted,
    onCallback,
  ]);

  if (!controller) {
    return <CreateController />;
  }

  if (isSuccess) {
    return (
      <HeaderInner
        variant="expanded"
        Icon={CheckIcon}
        title="Session Registered!"
        description="Return to the game to continue"
        hideIcon
      />
    );
  }

  if (isFailure) {
    return <Failure />;
  }

  if (isLoading) {
    return null;
  }

  if (!policies) {
    return <>No Session Policies</>;
  }

  return (
    <>
      {queries.public_key ? (
        <RegisterSession
          policies={policies}
          onConnect={onConnect}
          publicKey={queries.public_key}
        />
      ) : (
        <CreateSession policies={policies} onConnect={onConnect} />
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
