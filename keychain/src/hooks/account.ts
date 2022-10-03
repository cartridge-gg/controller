import { useMemo } from "react";
import { Scope } from "@cartridge/controller";
import { useRouter } from "next/router";
import { normalize as normalizeOrigin } from "utils/url";

export function useRequests() {
  const router = useRouter();

  const origin = useMemo(() => {
    const { origin } = router.query;

    if (!origin) {
      return;
    }

    return normalizeOrigin(origin as string);
  }, [router.query]);

  let requests: Scope[] = [];
  const { id, scopes } = router.query;
  if (scopes) {
    requests = JSON.parse(scopes as string);
  }

  return { id: id as string | undefined, origin, requests };
}
