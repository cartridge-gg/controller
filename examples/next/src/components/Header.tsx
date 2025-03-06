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
import { useState, useEffect, useRef, useMemo } from "react";
import { constants, num, shortString } from "starknet";
import { Chain } from "@starknet-react/chains";
import SessionConnector from "@cartridge/connector/session";

const Header = () => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain, chains } = useNetwork();
  const { address, status } = useAccount();
  const [networkOpen, setNetworkOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { switchChain } = useSwitchChain({
    params: {
      chainId: constants.StarknetChainId.SN_SEPOLIA,
    },
  });
  const networkRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const controllerConnector = useMemo(
    () => ControllerConnector.fromConnectors(connectors),
    [connectors],
  );

  const sessionConnector = useMemo(() => {
    try {
      return SessionConnector.fromConnectors(connectors);
    } catch {
      return undefined;
    }
  }, [connectors]);

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

    // reload the page when controller-reload(logout) event is received
    window.addEventListener(
      "message",
      (event) => {
        if (event.data === "controller-reload") {
          window.location.reload();
        }
      },
      false,
    );

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log("address: ", address);
  }, [address]);

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
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-0"
                onClick={() => {
                  switchChain({
                    chainId: shortString.encodeShortString("UNSUPPORTED"),
                  });
                  setNetworkOpen(false);
                }}
              >
                unsupported
              </button>
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
        <div className="flex gap-2">
          <Button
            onClick={() => {
              connect({ connector: controllerConnector });
            }}
          >
            Connect
          </Button>
          {sessionConnector && (
            <Button onClick={() => connect({ connector: sessionConnector })}>
              Register Session
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
