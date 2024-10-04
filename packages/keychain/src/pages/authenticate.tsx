import { useRouter } from "next/router";
import { AuthAction, Authenticate as AuthComponent } from "components/connect";
import dynamic from "next/dynamic";
import { constants } from "starknet";

// auth page used for externally embedded keychain
function Authenticate() {
  const router = useRouter();
  const { name, action, network } = router.query as {
    name: string;
    action: string;
    network?: string;
  };

  return (
    <AuthComponent
      name={decodeURIComponent(name)}
      action={decodeURIComponent(action) as AuthAction}
      network={network ?? constants.NetworkName.SN_SEPOLIA}
      onSuccess={() => {
        if (window.opener) {
          return window.close();
        }

        router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile`);
      }}
    />
  );
}

export default dynamic(() => Promise.resolve(Authenticate), { ssr: false });
