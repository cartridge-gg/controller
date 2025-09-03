"use client";

import { useState } from "react";
import { useAccount, useConnect } from "@starknet-react/core";
import { Button } from "@cartridge/ui/components/ui/button";
import { Input } from "@cartridge/ui/components/ui/input";
import { AuthOption } from "@cartridge/controller";

export function HeadlessAuth() {
  const { connect } = useConnect();
  const { isConnected, address } = useAccount();
  const [username, setUsername] = useState("");
  const [authMethod, setAuthMethod] = useState<AuthOption>("metamask");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleHeadlessConnect = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      // This will automatically use headless mode since username and authMethod are provided
      await connect({
        username: username.trim(),
        authMethod,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="p-4 border rounded-lg bg-green-50">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Successfully Connected (Headless)
        </h3>
        <p className="text-green-700">
          <strong>Username:</strong> {username}
        </p>
        <p className="text-green-700">
          <strong>Address:</strong> {address}
        </p>
        <p className="text-green-700">
          <strong>Auth Method:</strong> {authMethod}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Headless Authentication</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Auth Method</label>
          <select
            className="w-full p-2 border rounded"
            value={authMethod}
            onChange={(e) => setAuthMethod(e.target.value as AuthOption)}
          >
            <option value="metamask">MetaMask</option>
            <option value="rabby">Rabby</option>
            <option value="walletconnect">WalletConnect</option>
          </select>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <Button
          onClick={handleHeadlessConnect}
          disabled={loading || !username.trim()}
          className="w-full"
        >
          {loading ? "Connecting..." : "Connect Headlessly"}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Note:</strong> This demonstrates headless authentication
            where no modal is shown.
          </p>
          <p>
            <strong>Supported methods:</strong> MetaMask, Rabby, WalletConnect
          </p>
          <p>
            <strong>Not supported:</strong> WebAuthn (requires user
            interaction), Social logins
          </p>
        </div>
      </div>
    </div>
  );
}
