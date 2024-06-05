import { useRouter } from "next/router";
import { AuthAction, Authenticate as AuthComponent } from "components/connect";

// auth page used for externally embedded keychain
export default function Authenticate() {
  const router = useRouter();
  const { name, action } = router.query as { name: string; action: string };

  return (
    <AuthComponent
      name={decodeURIComponent(name)}
      action={decodeURIComponent(action) as AuthAction}
      onSuccess={() => {
        if (window.opener) {
          return window.close();
        }

        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
      }}
    />
  );
}
