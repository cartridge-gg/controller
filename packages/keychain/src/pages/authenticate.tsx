import { useRouter } from "next/router";
import type { NextPage } from "next";
import { Authenticate as AuthComponent } from "components/Auth";

// auth page used for externally embedded keychain
const Authenticate: NextPage = () => {
  const router = useRouter();
  const { name } = router.query as { name: string };
  return (
    <AuthComponent
      name={decodeURIComponent(name)}
      onComplete={() => {
        if (window.opener) {
          return window.close();
        }

        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
      }}
    />
  );
};

export default Authenticate;
