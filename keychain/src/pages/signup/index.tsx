import { useRouter } from "next/router";
import type { NextPage } from "next";
import Controller from "utils/controller";
import { Signup as SignupComponent } from "components/signup";
const Login: NextPage = () => {
  const router = useRouter();
  return (
    <SignupComponent
      fullPage
      showLogin={() => {
        router.push("/login");
      }}
      onComplete={() => {
        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
      }}
    />
  );
};

export default Login;
