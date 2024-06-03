import { useRouter } from "next/router";
import type { NextPage } from "next";
import { constants } from "starknet";
import { Login as LoginComponent } from "components";
import { useController } from "hooks/controller";

const Login: NextPage = () => {
  const router = useRouter();
  const { sp: starterPackId, rpcUrl } = router.query as {
    sp: string;
    rpcUrl: string;
  };
  const { setController } = useController();

  return (
    <LoginComponent
      chainId={constants.StarknetChainId.SN_SEPOLIA}
      rpcUrl={rpcUrl}
      onSignup={() => router.push({ pathname: "/signup", query: router.query })}
      onSuccess={async (controller) => {
        setController(controller);
        if (starterPackId) {
          router.replace(
            `${process.env.NEXT_PUBLIC_ADMIN_URL}/claim/${starterPackId}`,
          );
          return;
        }

        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
      }}
    />
  );
};

export default Login;
