import { useState } from "react";
import { Signup } from "./Signup";
import { Login } from "./Login";
import { useConnection } from "hooks/connection";
import { ConnectCtx } from "utils/connection";

export function CreateController() {
  const { chainId, rpcUrl, context, setController, error } = useConnection();
  const [showSignup, setShowSignup] = useState(false);
  const [prefilledUsername, setPrefilledUsername] = useState<string>();
  const ctx = context as ConnectCtx;

  console.log({ rpcUrl });

  if (error) {
    return <>{error.message}</>;
  }

  return showSignup ? (
    <Signup
      origin={ctx.origin}
      policies={ctx.policies}
      chainId={chainId}
      rpcUrl={rpcUrl}
      prefilledName={prefilledUsername}
      onLogin={(username) => {
        setPrefilledUsername(username);
        setShowSignup(false);
      }}
      onSuccess={setController}
    />
  ) : (
    <Login
      origin={ctx.origin}
      policies={ctx.policies}
      chainId={chainId}
      rpcUrl={rpcUrl}
      prefilledName={prefilledUsername}
      onSignup={(username) => {
        setPrefilledUsername(username);
        setShowSignup(true);
      }}
      onSuccess={setController}
    />
  );
}
