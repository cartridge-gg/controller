import { useRouter } from "next/router";
import { Login as LoginComponent } from "components/connect";
import { useConnection } from "hooks/connection";
import dynamic from "next/dynamic";

function Login() {
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
}

export default dynamic(() => Promise.resolve(Login), { ssr: false });
