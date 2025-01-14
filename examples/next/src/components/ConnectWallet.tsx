"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@cartridge/ui-next";

export function ConnectWallet() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const controller = connectors[0] as ControllerConnector;
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const dragRef = useRef<{ startX: number; startY: number }>();

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
