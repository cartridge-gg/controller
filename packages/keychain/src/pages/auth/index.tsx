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
    const query = Object.entries(router.query).reduce(
      (prev, [key, val], i) =>
        i === 0 ? `?${key}=${val}` : `${prev}&${key}=${val}`,
      "",
    );

    router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/auth/consent${query}`);
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
          isSlot
        />
      ) : (
        <Login
          prefilledName={prefilledUsername}
          onSignup={(username) => {
            setPrefilledUsername(username);
            setShowSignup(true);
          }}
          onController={setController}
          isSlot
        />
      )}
    </>
  );
};

export default Auth;
