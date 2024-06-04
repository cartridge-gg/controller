import { useState } from "react";
import { Signup } from "./Signup";
import { Login } from "./Login";
import { Policy } from "@cartridge/controller";
import { constants } from "starknet";
import { useController } from "hooks/controller";

export function CreateController(props: {
  origin?: string;
  policies?: Policy[];
  chainId?: constants.StarknetChainId;
}) {
  const { setController } = useController()
  const [showSignup, setShowSignup] = useState(false);
  const [prefilledUsername, setPrefilledUsername] = useState<string>();

  return showSignup ? (
    <Signup
      {...props}
      prefilledName={prefilledUsername}
      onLogin={(username) => {
        setPrefilledUsername(username);
        setShowSignup(false);
      }}
      onSuccess={setController}
    />
  ) : (
    <Login
      {...props}
      prefilledName={prefilledUsername}
      onSignup={(username) => {
        setPrefilledUsername(username);
        setShowSignup(true);
      }}
      onSuccess={setController}
    />
  );
}
