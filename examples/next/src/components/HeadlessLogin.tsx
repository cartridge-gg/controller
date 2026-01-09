"use client";

import { useState } from "react";
import { constants } from "starknet";
import Controller from "@cartridge/controller";

export function HeadlessLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    address?: string;
  } | null>(null);

  const handleHeadlessLogin = async () => {
    if (!username || !password) {
      setResult({
        success: false,
        message: "Please provide both username and password",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Create controller with headless mode
      const controller = new Controller({
        defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
        headless: {
          username,
          credentials: {
            type: "password",
            password,
          },
        },
      });

      // Attempt to connect without UI
      const account = await controller.connect();

      if (account) {
        setResult({
          success: true,
          message: "Successfully authenticated!",
          address: account.address,
        });
      } else {
        setResult({
          success: false,
          message: "Authentication failed - no account returned",
        });
      }
    } catch (error: unknown) {
      setResult({
        success: false,
        message:
          (error as Error)?.message || "Authentication failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Headless Login (Password)
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Test programmatic authentication without UI. This demonstrates the
        headless mode feature for server-side or automated authentication.
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
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="headless-password"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="headless-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            disabled={loading}
          />
        </div>

        <button
          onClick={handleHeadlessLogin}
          disabled={loading || !username || !password}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? "Authenticating..." : "Test Headless Login"}
        </button>
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

      <div className="mt-4 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <p className="text-xs text-yellow-800 dark:text-yellow-400">
          <strong>Note:</strong> Headless mode is currently in development. The
          keychain backend integration is not yet complete, so authentication
          will return a &quot;not yet implemented&quot; error. This component
          demonstrates the API and client-side integration.
        </p>
      </div>
    </div>
  );
}
