import { Login, Signup } from "components";
import { useController } from "hooks/controller";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

const Auth: NextPage = () => {
  const router = useRouter();

  const [showSignup, setShowSignup] = useState(false);
  const [prefilledUsername, setPrefilledUsername] = useState<string>();
  const [controller, setController] = useController();

  if (controller) {
    router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/auth/consent`);
  }

  return (
    <>
      {showSignup ? (
        <Signup
          prefilledName={prefilledUsername}
          onLogin={(username) => {
            setPrefilledUsername(username);
            setShowSignup(false);
          }}
          onController={setController}
        />
      ) : (
        <Login
          prefilledName={prefilledUsername}
          onSignup={(username) => {
            setPrefilledUsername(username);
            setShowSignup(true);
          }}
          onController={setController}
        />
      )}
    </>
  );
};

export default Auth;
