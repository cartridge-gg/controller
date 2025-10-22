"use client";

import { useState, useEffect } from "react";
import { useConnect, useDisconnect, useAccount } from "@starknet-react/core";
import { useControllerConfig } from "./providers/ControllerConfigProvider";

export function ConfigurationPanel() {
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  const { config, updateConfig } = useControllerConfig();

  const [preset, setPreset] = useState(config.preset);
  const [slot, setSlot] = useState(config.slot);
  const [namespace, setNamespace] = useState(config.namespace);
  const [shouldOverridePresetPolicies, setShouldOverridePresetPolicies] =
    useState(config.shouldOverridePresetPolicies);
  const [selectedTokens, setSelectedTokens] = useState<string[]>(config.tokens);
  const [isApplying, setIsApplying] = useState(false);

  // Update local state when config changes
  useEffect(() => {
    setPreset(config.preset);
    setSlot(config.slot);
    setNamespace(config.namespace);
    setShouldOverridePresetPolicies(config.shouldOverridePresetPolicies);
    setSelectedTokens(config.tokens);
  }, [config]);

  const availablePresets = ["pistols", "eternum", "blobert", "realms", "drive"];
  const availableTokens = ["eth", "strk", "lords", "usdc", "usdt"];

  const handleTokenToggle = (token: string) => {
    setSelectedTokens((prev) =>
      prev.includes(token) ? prev.filter((t) => t !== token) : [...prev, token],
    );
  };

  const handleApplyConfiguration = async () => {
    setIsApplying(true);

    try {
      // Update the configuration context
      updateConfig({
        preset,
        slot,
        namespace,
        shouldOverridePresetPolicies,
        tokens: selectedTokens,
      });

      // If connected, disconnect and reconnect with new config
      if (address) {
        await disconnect();
        // Wait a bit for disconnect to complete
        setTimeout(() => {
          const controller = connectors[0];
          if (controller) {
            connect({ connector: controller });
          }
          setIsApplying(false);
        }, 500);
      } else {
        setIsApplying(false);
      }
    } catch (error) {
      console.error("Failed to apply configuration:", error);
      setIsApplying(false);
    }
  };

  const hasChanges =
    preset !== config.preset ||
    slot !== config.slot ||
    namespace !== config.namespace ||
    shouldOverridePresetPolicies !== config.shouldOverridePresetPolicies ||
    JSON.stringify(selectedTokens) !== JSON.stringify(config.tokens);

  return (
    <div className="rounded-xl bg-base-100 p-8 shadow-lg border border-base-300">
      <h2 className="text-2xl font-bold mb-6 text-primary">
        Controller Configuration
      </h2>

      <div className="space-y-6">
        {/* Preset Selection */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Preset</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
          >
            {availablePresets.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              The preset determines default policies and configuration
            </span>
          </label>
        </div>

        {/* Slot Input */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Slot</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            placeholder="arcade-pistols"
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              The project name of your Slot instance
            </span>
          </label>
        </div>

        {/* Namespace Input */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Namespace</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            placeholder="pistols"
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Used to fetch trophies data from the indexer
            </span>
          </label>
        </div>

        {/* Override Policies Toggle */}
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-4">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={shouldOverridePresetPolicies}
              onChange={(e) =>
                setShouldOverridePresetPolicies(e.target.checked)
              }
            />
            <div>
              <span className="label-text font-semibold">
                Override Preset Policies
              </span>
              <p className="label-text-alt text-base-content/60">
                When enabled, manually provided policies override preset
                policies
              </p>
            </div>
          </label>
        </div>

        {/* Token Selection */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">ERC20 Tokens</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTokens.map((token) => (
              <label key={token} className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={selectedTokens.includes(token)}
                  onChange={() => handleTokenToggle(token)}
                />
                <span className="label-text uppercase">{token}</span>
              </label>
            ))}
          </div>
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Tokens to be listed in the Inventory modal
            </span>
          </label>
        </div>

        {/* Apply Button */}
        <div className="flex gap-4">
          <button
            className="btn btn-primary flex-1"
            onClick={handleApplyConfiguration}
            disabled={!hasChanges || isApplying}
          >
            {isApplying ? (
              <>
                <span className="loading loading-spinner"></span>
                Applying...
              </>
            ) : hasChanges ? (
              "Apply Configuration"
            ) : (
              "No Changes"
            )}
          </button>
        </div>

        {/* Current Config Display */}
        <div className="alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div className="text-sm">
            <div className="font-semibold">Current Configuration:</div>
            <div className="text-xs opacity-70 mt-1">
              Preset: {config.preset} | Slot: {config.slot} | Namespace:{" "}
              {config.namespace}
            </div>
          </div>
        </div>

        {/* Info Alert */}
        {address && hasChanges && (
          <div className="alert alert-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <span className="text-sm">
              Applying configuration will disconnect and reconnect your wallet
              with the new settings
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
