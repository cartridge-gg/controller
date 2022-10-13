import { useMemo } from "react";
import { Policy } from "@cartridge/controller";
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

  let requests: Policy[] = [];
  const { id, policies } = router.query;
  if (policies) {
    requests = JSON.parse(policies as string);
  }

  return { id: id as string | undefined, origin, requests };
}
