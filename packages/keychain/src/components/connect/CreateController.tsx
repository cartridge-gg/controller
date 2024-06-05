import { useState } from "react";
import { Signup } from "./Signup";
import { Login } from "./Login";
import { useConnection } from "hooks/connection";
import { ConnectCtx } from "utils/connection";

export function CreateController({ isSlot }: { isSlot?: boolean }) {
  const { chainId, rpcUrl, context, setController, error } = useConnection();
  const [showSignup, setShowSignup] = useState(false);
  const [prefilledUsername, setPrefilledUsername] = useState<string>();
  const ctx = context as ConnectCtx;

  if (error) {
    return <>{error.message}</>;
  }

  return showSignup ? (
    <Signup
      origin={ctx?.origin}
      policies={ctx?.policies}
      chainId={chainId}
      rpcUrl={rpcUrl}
      prefilledName={prefilledUsername}
      onLogin={(username) => {
        setPrefilledUsername(username);
        setShowSignup(false);
      }}
      onSuccess={setController}
      isSlot={isSlot}
    />
  ) : (
    <Login
      origin={ctx?.origin}
      policies={ctx?.policies}
      chainId={chainId}
      rpcUrl={rpcUrl}
      prefilledName={prefilledUsername}
      onSignup={(username) => {
        setPrefilledUsername(username);
        setShowSignup(true);
      }}
      onSuccess={setController}
      isSlot={isSlot}
    />
  );
}
