import { useRouter } from "next/router";
import type { NextPage } from "next";
import { Signup as SignupComponent } from "components";
import { useController } from "hooks/controller";

const Signup: NextPage = () => {
  const router = useRouter();
  const [controller] = useController();

  if (controller) {
    router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
  }

  return (
    <SignupComponent
      onLogin={() => router.push({ pathname: "/login", query: router.query })}
      onSuccess={() => {
        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
      }}
    />
  );
};

export default Signup;
