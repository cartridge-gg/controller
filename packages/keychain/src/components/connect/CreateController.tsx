import { useState } from "react";
import { Signup } from "./Signup";
import { Login } from "./Login";
import { useConnection } from "hooks/connection";
import { LoginMode } from "./types";

export function CreateController({
  isSlot,
  loginMode,
}: {
  isSlot?: boolean;
  loginMode?: LoginMode;
}) {
  const { error } = useConnection();
  const [showSignup, setShowSignup] = useState(true);
  const [prefilledUsername, setPrefilledUsername] = useState<string>();

  if (error) {
    return <>{error.message}</>;
  }

  return showSignup ? (
    <Signup
      prefilledName={prefilledUsername}
      onLogin={(username) => {
        setPrefilledUsername(username);
        setShowSignup(false);
      }}
      isSlot={isSlot}
    />
  ) : (
    <Login
      prefilledName={prefilledUsername}
      onSignup={(username) => {
        setPrefilledUsername(username);
        setShowSignup(true);
      }}
      mode={loginMode}
      isSlot={isSlot}
    />
  );
}
