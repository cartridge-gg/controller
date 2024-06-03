import { useRouter } from "next/router";
import { Signup as SignupComponent } from "components";
import { useController } from "hooks/controller";

export default function Signup() {
  const router = useRouter();
  const { controller, setController } = useController();

  if (controller) {
    router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
  }

  const { chainId, rpcUrl } = router.query as {
    chainId: string;
    rpcUrl: string;
  };

  return (
    <SignupComponent
      chainId={chainId}
      rpcUrl={rpcUrl}
      onLogin={() => router.push({ pathname: "/login", query: router.query })}
      onSuccess={(controller) => {
        setController(controller);
        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
      }}
    />
  );
}
