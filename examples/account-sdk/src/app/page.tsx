"use client";

import { useCallback, useEffect, useState } from "react";
import init, { generateKey } from "@cartridge/account-sdk";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [privKey, setPrivKey] = useState<string>();

  const onClick = useCallback(() => {
    const privKey = generateKey();
    setPrivKey(privKey);
  }, []);

  useEffect(() => {
    init().then(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <main className="flex flex-col items-center p-24 gap-4">
      {isLoading ? (
        <p>Loading WASM...</p>
      ) : (
        <>
          <button onClick={onClick}>Generate Key</button>
          {privKey && <p>Key: {privKey}</p>}
        </>
      )}
    </main>
  );
}
