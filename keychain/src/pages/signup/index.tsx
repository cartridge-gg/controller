import { useRouter } from "next/router";
import type { NextPage } from "next";
import { Signup as SignupComponent } from "components/signup";
const Login: NextPage = () => {
  const router = useRouter();
  const { web3auth } = router.query as { web3auth: string };

  return (
    <SignupComponent
      web3AuthEnabled={!!web3auth}
      showLogin={() => router.push({ pathname: "/login", query: router.query })}
      onComplete={() =>
        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`)
      }
      fullPage
    />
  );
};

export default Login;
