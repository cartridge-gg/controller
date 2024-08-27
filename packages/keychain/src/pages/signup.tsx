"use client";

import { useRouter } from "next/router";
import { Signup as SignupComponent } from "components/connect";
import { useConnection } from "hooks/connection";

export default function Signup() {
  const router = useRouter();
  const { controller, rpcUrl, chainId, error } = useConnection();

  const navigateToSuccess = (title: string) => {
    router.replace({
      pathname: "/success",
      query: {
        title,
        description: "Your controller is ready",
      },
    });
  };

  if (error) {
    return <>{error.message}</>;
  }

  if (controller) {
    navigateToSuccess("Already signed up!");
  }

  if (!rpcUrl || !chainId) {
    return <></>;
  }

  return (
    <SignupComponent
      onLogin={() => router.push({ pathname: "/login", query: router.query })}
      onSuccess={() => navigateToSuccess("Signed up!")}
    />
  );
}
