import { Login, Signup, LoadingLogo } from "components";
import { useMeQuery } from "generated/graphql";
import { useController } from "hooks/controller";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/** This page is for authenticating with Slot */
const Auth: NextPage = () => {
  const router = useRouter();

  const [showSignup, setShowSignup] = useState(false);
  const [prefilledUsername, setPrefilledUsername] = useState<string>();
  const [controller, setController] = useController();

  const { data: user, isFetched } = useMeQuery();

  useEffect(() => {
    if (user && controller) {
      const query = Object.entries(router.query).reduce(
        (prev, [key, val], i) =>
          i === 0 ? `?${key}=${val}` : `${prev}&${key}=${val}`,
        "",
      );

      router.replace(`/slot/auth/consent${query}`);
    }
  }, [user, controller, router]);

  if (!isFetched) {
    return <LoadingLogo />;
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
