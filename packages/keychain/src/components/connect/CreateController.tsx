import { useEffect, useState } from "react";
import { Signup } from "./Signup";
import { Login } from "./Login";
import { useConnection } from "hooks/connection";
import { LoginMode } from "./types";
import { isSignedUp } from "../../utils/cookie";
import { usePostHog } from "posthog-js/react";

export function CreateController({
  isSlot,
  loginMode,
  onCreated,
}: {
  isSlot?: boolean;
  loginMode?: LoginMode;
  onCreated?: () => void;
}) {
  const posthog = usePostHog();
  const { error } = useConnection();
  const [showSignup, setShowSignup] = useState(true);
  const [prefilledUsername, setPrefilledUsername] = useState<string>();

  useEffect(() => {
    if (!document) return;

    setShowSignup(!isSignedUp());
  }, []);

  if (error) {
    return <>{error.message}</>;
  }

  return showSignup ? (
    <Signup
      prefilledName={prefilledUsername}
      onLogin={(username) => {
        posthog?.capture("Toggle Login");
        setPrefilledUsername(username);
        setShowSignup(false);
        onCreated?.();
      }}
      isSlot={isSlot}
    />
  ) : (
    <Login
      prefilledName={prefilledUsername}
      onSignup={(username) => {
        posthog?.capture("Toggle Signup");
        setPrefilledUsername(username);
        setShowSignup(true);
        onCreated?.();
      }}
      mode={loginMode}
      isSlot={isSlot}
    />
  );
}
