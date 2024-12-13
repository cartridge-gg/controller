import { useRouter } from "next/router";
import {
  AuthAction,
  Authenticate as AuthComponent,
} from "@/components/connect";
import dynamic from "next/dynamic";
import { constants } from "starknet";
import { useEffect, useState } from "react";

// auth page used for externally embedded keychain
function Authenticate() {
  const router = useRouter();
  const [params, setParams] = useState<{
    name: string;
    action: string;
    network?: string;
  }>();

  useEffect(() => {
    if (router.isReady && !params) {
      const { name, action, network } = router.query as {
        name: string;
        action: string;
        network?: string;
      };

      if (name && action) {
        setParams({ name, action, network });

        // Remove query params to avoid issues with password managers
        router.replace(router.pathname, undefined, { shallow: true });
      }
    }
  }, [router.isReady, params]);

  if (!params) {
    return null;
  }

  return (
    <AuthComponent
      name={decodeURIComponent(params.name)}
      action={decodeURIComponent(params.action) as AuthAction}
      network={params.network ?? constants.NetworkName.SN_MAIN}
      onSuccess={() => {
        if (window.opener) {
          return window.close();
        }

        router.replace(`${import.meta.env.VITE_ADMIN_URL}/profile`);
      }}
    />
  );
}

export default dynamic(() => Promise.resolve(Authenticate), { ssr: false });
