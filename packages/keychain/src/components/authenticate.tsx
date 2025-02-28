import { Authenticate as AuthComponent } from "#components/connect";
import { constants } from "starknet";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthAction } from "./connect/authenticate";

// auth page used for externally embedded keychain
export function Authenticate() {
  const [searchParams] = useSearchParams();
  const [params, setParams] = useState<{
    name: string;
    action: string;
    network: string | null;
  }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (params) {
      return;
    }
    const name = searchParams.get("name");
    const action = searchParams.get("action");
    const network = searchParams.get("network");
    if (name && action) {
      setParams({ name, action, network });

      // Remove query params to avoid issues with password managers
      navigate(".", { replace: true });
    }
  }, [params, searchParams, navigate]);

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

        navigate(`${import.meta.env.VITE_ADMIN_URL}/profile`);
      }}
    />
  );
}
