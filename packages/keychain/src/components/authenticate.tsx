import { Authenticate as AuthComponent } from "@/components/connect";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { constants } from "starknet";
import { AuthAction } from "./connect/authenticate";

// auth page used for externally embedded keychain
export function Authenticate() {
  const searchParams = useLocalSearchParams();
  const [params, setParams] = useState<{
    name: string;
    action: string;
    network: string | null;
    appId: string | null;
  }>();
  const router = useRouter();

  useEffect(() => {
    if (params) {
      return;
    }
    const name = searchParams.name as string;
    const action = searchParams.action as string;
    const network = searchParams.network as string;
    const appId = searchParams.appId as string;
    if (name && action) {
      setParams({ name, action, network, appId });

      // Remove query params to avoid issues with password managers
      router.replace(".");
    }
  }, [params, searchParams, router]);

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

        router.push(process.env.EXPO_PUBLIC_ADMIN_URL!);
      }}
    />
  );
}
