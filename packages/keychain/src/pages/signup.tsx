import { useRouter } from "next/router";
import { Signup as SignupComponent } from "components/connect";
import { useConnection } from "hooks/connection";

export default function Signup() {
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
    <SignupComponent
      onLogin={() => router.push({ pathname: "/login", query: router.query })}
      onSuccess={() => {
        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
      }}
    />
  );
}
