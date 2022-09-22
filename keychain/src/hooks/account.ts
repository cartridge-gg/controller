import { useMemo } from "react";
import { Scope } from "@cartridge/controller";
import { useRouter } from "next/router";
import { AccountInterface, Call } from "starknet";

export function useRequests() {
  const router = useRouter();

  const url = useMemo(() => {
    const { origin } = router.query;
    console.log(origin)
    if (!origin) {
      return;
    }
    const url = new URL(origin as string);
    return url;
  }, [router.query]);

  let requests: Scope[] = [];
  const { id, scopes } = router.query;
  if (scopes) {
    requests = JSON.parse(scopes as string);
  }

  console.log(url)
  return { id: id as string | undefined, url, requests };
}

export function useExecuteParams() {
  const router = useRouter();

  const url = useMemo(() => {
    const { origin } = router.query;
    if (!origin) {
      return;
    }
    const url = new URL(origin as string);
    return url;
  }, [router.query]);

  let parsed: Call[] = [];
  const { id, calls } = router.query;
  if (calls) {
    parsed = JSON.parse(calls as string);
  }

  return { id: id as string | undefined, url, calls: parsed };
}
