"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@cartridge/ui";

export function ConnectWallet() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const controller = connectors[0] as ControllerConnector;
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const dragRef = useRef<{ startX: number; startY: number }>(undefined);

  useEffect(() => {
    setPosition({
      x: window.innerWidth - 220,
      y: window.innerHeight - 220,
    });
  }, []);

  const [username, setUsername] = useState<string>();
  useEffect(() => {
    if (!address) return;
    controller.username()?.then((n) => setUsername(n));
  }, [address, controller]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.pageX - position.x,
      startY: e.pageY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragRef.current) return;

    setPosition({
      x: e.pageX - dragRef.current.startX,
      y: e.pageY - dragRef.current.startY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = undefined;
  };

  const registerSessionUrl =
    "http://localhost:3001/session?public_key=0x2cb057c18198ae4555a144bfdace051433b9a545dc88224de58fa04e323f269&redirect_uri=http://localhost:3002&policies=%5B%7B%22target%22:%220x03661Ea5946211b312e8eC71B94550928e8Fd3D3806e43c6d60F41a6c5203645%22,%22method%22:%22attack%22,%22description%22:%22Attack%20the%20beast%22%7D,%7B%22target%22:%220x03661Ea5946211b312e8eC71B94550928e8Fd3D3806e43c6d60F41a6c5203645%22,%22method%22:%22claim%22,%22description%22:%22Claim%20your%20tokens%22%7D%5D&rpc_url=http://localhost:8001/x/starknet/sepolia";

  const openRegisterSessionUrl = () => {
    window.open(registerSessionUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{ position: "relative" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {address && (
        <>
          <p>Account: {address} </p>
          {username && <p>Username: {username}</p>}
        </>
      )}
      {address ? (
        <Button onClick={() => disconnect()}>Disconnect</Button>
      ) : (
        <div className="flex gap-1">
          <Button onClick={() => connect({ connector: controller })}>
            Connect
          </Button>
          {/* <Button onClick={() => connect({ connector: session })}>
            Create Session
          </Button> */}
          <Button onClick={openRegisterSessionUrl}>Register Session</Button>
        </div>
      )}

      {/* Draggable test overlay */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          width: 200,
          height: 200,
          backgroundColor: "rgba(255, 0, 0, 0.3)",
          border: "2px solid red",
          cursor: isDragging ? "grabbing" : "grab",
          zIndex: 10001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
        }}
      >
        <div
          style={{
            color: "white",
            textAlign: "center",
            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
            pointerEvents: "none",
          }}
        >
          Drag me around
          <br />
          (Clickjacking Test)
        </div>
      </div>
    </div>
  );
}
