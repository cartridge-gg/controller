import { useRouter } from "next/router";
import type { NextPage } from "next";
import { Login as LoginComponent } from "components";
import { useConnection } from "hooks/connection";

const Login: NextPage = () => {
  const router = useRouter();
  const { controller, rpcUrl, chainId, error } = useConnection();

  if (error) {
    return <>{error.message}</>;
  }

  if (controller) {
    router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
  }

  if (!rpcUrl || !chainId) {
    return <></>;
  }

  return (
    <LoginComponent
      onSignup={() => router.push({ pathname: "/signup", query: router.query })}
      onSuccess={async () => {
        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
      }}
    />
  );
};

export default Login;
