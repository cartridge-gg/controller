import { Login, Signup } from "components";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Controller from "utils/controller";

const Auth: NextPage = () => {
  const router = useRouter();
  // const {} = router.query as {};

  const [showSignup, setShowSignup] = useState(false);
  const [prefilledUsername, setPrefilledUsername] = useState<string>();
  const [controller, setController] = useState<Controller>();

  useEffect(() => {
    setController(Controller.fromStore());
  }, [setController]);

  if (controller) {
    // Controller exists (user logged in already)
    // redirect to consent
    router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/auth/consent`);
  }

  return (
    <>
      {showSignup ? (
        <Signup
          fullPage
          prefilledName={prefilledUsername}
          onLogin={(username) => {
            setPrefilledUsername(username);
            setShowSignup(false);
          }}
          onController={setController}
        />
      ) : (
        <Login
          fullPage
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
