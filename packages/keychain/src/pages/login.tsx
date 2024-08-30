"use client";

import { useRouter } from "next/router";
import { Login as LoginComponent } from "components/connect";
import { useConnection } from "hooks/connection";

export default function Login() {
  const router = useRouter();
  const { controller, rpcUrl, chainId, error } = useConnection();

  const navigateToSuccess = () => {
    router.replace({
      pathname: "/success",
      query: {
        title: "Logged in!",
        description: "Your controller is ready",
      },
    });
  };

  if (error) {
    return <>{error.message}</>;
  }

  if (controller) {
    navigateToSuccess();
  }

  if (!rpcUrl || !chainId) {
    return <></>;
  }

  return (
    <LoginComponent
      onSignup={() => router.push({ pathname: "/signup", query: router.query })}
      onSuccess={navigateToSuccess}
    />
  );
}
