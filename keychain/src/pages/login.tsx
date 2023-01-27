import { useRouter } from "next/router";
import type { NextPage } from "next";
import { constants } from "starknet";
import Controller from "utils/controller";
import { Login as LoginComponent } from "components/Login";
const Login: NextPage = () => {
  const router = useRouter();
  return (
    <LoginComponent
      chainId={constants.StarknetChainId.TESTNET}
      showSignup={() => router.push("/signup")}
      onComplete={() =>
        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`)
      }
      fullPage
    />
  );
};

export default Login;
