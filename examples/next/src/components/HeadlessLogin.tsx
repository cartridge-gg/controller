"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useConnect } from "@starknet-react/core";
import { controllerConnector } from "./providers/StarknetProvider";

type AuthMethod = "passkey" | "metamask";

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMetaMask?: boolean;
}

export function HeadlessLogin({ onStart }: { onStart?: () => void }) {
  const { connectAsync } = useConnect();
  const { address } = useAccount();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState<AuthMethod | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    address?: string;
  } | null>(null);
  const prepareHeadlessConnect = async () => {
    const controller = controllerConnector.controller;
    // Ensure we don't short-circuit on an existing account.
    if (controller.isReady()) {
      await controller.disconnect();
    }
    return controller;
  };

  const syncConnectionState = useCallback(async () => {
    if (address) {
      return;
    }
    await connectAsync({ connector: controllerConnector });
  }, [address, connectAsync]);

  useEffect(() => {
    const controller = controllerConnector.controller;
    const handleApproved = async (account: { address: string }) => {
      await syncConnectionState();
      setPendingApproval(false);
      setResult({
        success: true,
        message: "Session approved!",
        address: account.address,
      });
      setLoading(null);
    };

    const unsubscribe =
      controller.onHeadlessApprovalComplete?.(handleApproved) ?? undefined;

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      } else {
        controller.offHeadlessApprovalComplete?.(handleApproved);
      }
    };
  }, [syncConnectionState]);

  const handlePasskeyLogin = async () => {
    if (!username) {
      setResult({
        success: false,
        message: "Please provide a username",
      });
      return;
    }

    onStart?.();
    setLoading("passkey");
    setPendingApproval(false);
    setResult(null);

    try {
      const controller = await prepareHeadlessConnect();

      const account = await controller.connect({
        username,
        signer: "webauthn",
      });

      if (account) {
        await syncConnectionState();
        setResult({
          success: true,
          message: "Successfully authenticated with Passkey!",
          address: account.address,
        });
      } else {
        setResult({
          success: true,
          message: "Waiting for session approval...",
        });
        setPendingApproval(true);
      }
    } catch (error: unknown) {
      setResult({
        success: false,
        message: (error as Error)?.message || "Passkey authentication failed",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleMetaMaskLogin = async () => {
    if (!username) {
      setResult({
        success: false,
        message: "Please provide a username",
      });
      return;
    }

    onStart?.();
    setLoading("metamask");
    setPendingApproval(false);
    setResult(null);

    try {
      // Check if MetaMask is installed
      const ethereum = (window as { ethereum?: EthereumProvider }).ethereum;
      if (!ethereum) {
        setResult({
          success: false,
          message: "MetaMask is not installed",
        });
        setLoading(null);
        return;
      }

      // Request account access
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        setResult({
          success: false,
          message: "No MetaMask accounts found",
        });
        setLoading(null);
        return;
      }

      const controller = await prepareHeadlessConnect();

      const account = await controller.connect({
        username,
        signer: "metamask",
      });

      if (account) {
        await syncConnectionState();
        setResult({
          success: true,
          message: "Successfully authenticated with MetaMask!",
          address: account.address,
        });
      } else {
        setResult({
          success: true,
          message: "Waiting for session approval...",
        });
        setPendingApproval(true);
      }
    } catch (error: unknown) {
      setResult({
        success: false,
        message: (error as Error)?.message || "MetaMask authentication failed",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Headless Login
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Test programmatic authentication without UI. This demonstrates the
        headless mode feature for automated authentication with Passkey or
        MetaMask.
      </p>

      <div className="space-y-3">
        <div>
          <label
            htmlFor="headless-username"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username
          </label>
          <input
            id="headless-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            disabled={loading !== null}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePasskeyLogin}
            disabled={loading !== null || !username || pendingApproval}
            className="flex-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            {loading === "passkey" ? "Authenticating..." : "Login with Passkey"}
          </button>

          <button
            onClick={handleMetaMaskLogin}
            disabled={loading !== null || !username || pendingApproval}
            className="flex-1 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            {loading === "metamask"
              ? "Authenticating..."
              : "Login with MetaMask"}
          </button>
        </div>
      </div>

      {result && (
        <div
          className={`mt-4 rounded-md p-4 ${
            result.success
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          <p className="text-sm font-medium">
            {result.success ? "✓ Success" : "✗ Error"}
          </p>
          <p className="mt-1 text-sm">{result.message}</p>
          {result.address && (
            <p className="mt-2 break-all font-mono text-xs">
              Address: {result.address}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 space-y-2 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-xs text-blue-800 dark:text-blue-400">
          <strong>Passkey Authentication:</strong> Uses the passkey signer
          already registered for this username. Make sure the account has a
          WebAuthn signer before testing.
        </p>
        <p className="text-xs text-blue-800 dark:text-blue-400">
          <strong>MetaMask Authentication:</strong> Requires MetaMask browser
          extension to be installed. Will prompt for account connection when
          clicked.
        </p>
        <p className="text-xs text-blue-800 dark:text-blue-400">
          <strong>Note:</strong> Headless mode auto-submits login. With no
          policies, sign-in completes without session approval UI. If policies
          are unverified or include approvals, Keychain will prompt for session
          approval after authentication; verified policies auto-create the
          session. Use <code>connect({"{ username, signer }"})</code> and pass{" "}
          <code>password</code> when using the password signer.
        </p>
      </div>
    </div>
  );
}
