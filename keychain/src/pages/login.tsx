import { useRouter } from "next/router";
import type { NextPage } from "next";
import { constants } from "starknet";
import { Login as LoginComponent } from "components/Login";
const Login: NextPage = () => {
  const router = useRouter();
  const { web3auth } = router.query as { web3auth: string };
  return (
    <LoginComponent
      web3AuthEnabled={!!web3auth}
      chainId={constants.StarknetChainId.TESTNET}
      showSignup={() =>
        router.push({ pathname: "/signup", query: router.query })
      }
      onComplete={() =>
        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`)
      }
      fullPage
    />
  );
};

export default Login;
