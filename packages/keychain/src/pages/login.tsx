import { useRouter } from "next/router";
import type { NextPage } from "next";
import { constants } from "starknet";
import { Login as LoginComponent } from "components";

const Login: NextPage = () => {
  const router = useRouter();
  const { sp: starterPackId } = router.query as { sp: string };
  return (
    <LoginComponent
      chainId={constants.StarknetChainId.SN_GOERLI}
      onSignup={() => router.push({ pathname: "/signup", query: router.query })}
      onComplete={() => {
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
