import { Authenticate as AuthComponent } from "@/components/connect";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { constants } from "starknet";
import { AuthAction } from "./connect/authenticate";

// auth page used for externally embedded keychain
export function Authenticate() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [params, setParams] = useState<{
    name: string;
    action: string;
    network: string | null;
    appId: string | null;
  }>();

  useEffect(() => {
    if (params) {
      return;
    }
    const name = searchParams.get("name");
    const action = searchParams.get("action");
    const network = searchParams.get("network");
    const appId = searchParams.get("appId");
    if (name && action) {
      setParams({ name, action, network, appId });

      // Remove query params to avoid issues with password managers
      setSearchParams({}, { replace: true });
    }
  }, [params, searchParams, navigate, setSearchParams]);

  if (!params) {
    return null;
  }

  return (
    <AuthComponent
      name={decodeURIComponent(params.name)}
      action={decodeURIComponent(params.action) as AuthAction}
      network={params.network ?? constants.NetworkName.SN_MAIN}
      appId={decodeURIComponent(params.appId ?? "")}
      onSuccess={() => {
        if (window.opener) {
          return window.close();
        }

        navigate(`${import.meta.env.VITE_ADMIN_URL}`);
      }}
    />
  );
}
