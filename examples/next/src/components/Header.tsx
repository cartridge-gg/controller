"use client";

import { Button } from "@cartridge/ui-next";
import ControllerConnector from "@cartridge/connector/controller";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchChain,
} from "@starknet-react/core";
import { useState, useEffect, useRef } from "react";
import { constants, num } from "starknet";
import { Chain } from "@starknet-react/chains";

const Header = () => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain, chains } = useNetwork();
  const { address, connector, status } = useAccount();
  const controllerConnector = connector as never as ControllerConnector;
  const [networkOpen, setNetworkOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { switchChain } = useSwitchChain({
    params: {
      chainId: constants.StarknetChainId.SN_SEPOLIA,
    },
  });
  const networkRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        networkRef.current &&
        !networkRef.current.contains(event.target as Node)
      ) {
        setNetworkOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full absolute top-0 left-0 p-5 flex items-center">
      <div className="flex-1" />
      {status === "connected" && (
        <div className="relative" ref={networkRef}>
          <Button
            onClick={() => {
              setNetworkOpen(!networkOpen);
              setProfileOpen(false);
            }}
            className="flex items-center gap-2 min-w-[120px]"
          >
            {chain.network}
            <span
              className={`transition-transform duration-200 ${
                networkOpen ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </Button>
          {networkOpen && (
            <div className="absolute right-0 top-full mt-1 bg-background shadow-lg rounded-md min-w-[160px] py-1 z-10 border border-gray-600">
              {chains.map((c: Chain) => (
                <button
                  key={c.id}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-0"
                  onClick={() => {
                    switchChain({ chainId: num.toHex(c.id) });
                    setNetworkOpen(false);
                  }}
                >
                  {c.network}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {address ? (
        <div className="relative ml-2" ref={profileRef}>
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
            <div className="absolute right-0 top-full mt-1 bg-background shadow-lg rounded-md min-w-[160px] py-1 z-10 border border-gray-600">
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