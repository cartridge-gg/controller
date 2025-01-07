"use client";

import { Button } from "@cartridge/ui-next";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useMemo, useState } from "react";
import { constants, num } from "starknet";

const Header = ({
  showBack,
  lockChain,
}: {
  showBack?: boolean;
  lockChain?: boolean;
}) => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, connector, chainId } = useAccount();
  const controllerConnector = connector as never as ControllerConnector;
  const chains = [
    { name: "Mainnet", id: constants.StarknetChainId.SN_MAIN },
    { name: "Sepolia", id: constants.StarknetChainId.SN_SEPOLIA },
  ];

  const [networkOpen, setNetworkOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

    const chainName = useMemo(() => {
      if (chainId) {
        return chains.find((c) => c.id === num.toHex(chainId))?.name;
      }
    }, [chains, chainId]);

  return (
    <div className="w-full absolute top-0 left-0 p-5 flex items-center">
      {showBack && (
        <button
          className="absolute top-5 left-5 w-6 h-6 cursor-pointer"
          onClick={() => {
            window.history.back();
          }}
        >
          ←
        </button>
      )}
      <div className="flex-1" />
      {chainId && <div className="relative">
        <Button
          onClick={() => {
            setNetworkOpen(!networkOpen);
            setProfileOpen(false);
          }}
          disabled={lockChain}
          className="flex items-center gap-2 min-w-[120px]"
        >
          {chainName}
          <span
            className={`transition-transform duration-200 ${
              networkOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </Button>
        {networkOpen && (
          <div className="absolute right-0 top-full mt-1 bg-gray-700 shadow-lg rounded-md min-w-[160px] py-1 z-10">
            {chains.map((c) => (
              <button
                key={c.id}
                className="block w-full px-4 py-2 text-left hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-0"
                onClick={() => {
                  console.log(c.id);
                  setNetworkOpen(false);
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>}
      {address ? (
        <div className="relative ml-2">
          <Button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNetworkOpen(false);
            }}
            className="flex items-center gap-2 min-w-[120px]"
          >
            <strong className="truncate max-w-[120px]">{address}</strong>
            <span
              className={`transition-transform duration-200 ${
                profileOpen ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </Button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 bg-gray-700 shadow-lg rounded-md min-w-[160px] py-1 z-10">
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-600 transition-colors border-b border-gray-600"
                onClick={() => controllerConnector.controller.openProfile()}
              >
                Profile
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-600 transition-colors border-b border-gray-600"
                onClick={() => controllerConnector.controller.openSettings()}
              >
                Settings
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-600 transition-colors"
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      ) : (
        <Button
          onClick={() => {
            connect({ connector: connectors[0] });
          }}
        >
          Connect
        </Button>
      )}
    </div>
  );
};

export default Header;
