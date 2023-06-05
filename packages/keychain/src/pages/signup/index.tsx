import { useRouter } from "next/router";
import type { NextPage } from "next";
import { Signup as SignupComponent } from "components/signup";
import { useMemo } from "react";
import Controller from "utils/controller";

const Signup: NextPage = () => {
  const router = useRouter();
  const { sp: starterPackId } = router.query as { sp: string };
  const controller = useMemo(() => Controller.fromStore(), []);

  if (controller) {
    router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
  }

  return (
    <SignupComponent
      starterPackId={starterPackId}
      showLogin={() => router.push({ pathname: "/login", query: router.query })}
      onComplete={() => {
        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
      }}
      fullPage
    />
  );
};

export default Signup;
