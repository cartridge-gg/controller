import { useCallback } from "react";
import { greet } from "@cartridge/account-sdk";

export default function Home() {
  const onClick = useCallback(() => {
    greet();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button onClick={onClick}>greet</button>
    </main>
  );
}
