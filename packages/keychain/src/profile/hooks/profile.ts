import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";

export function useProfileContext() {
  const [searchParams] = useSearchParams();

  const project = useMemo(() => {
    const psParam = searchParams.get("ps");
    return psParam ? decodeURIComponent(psParam) : undefined;
  }, [searchParams]);

  const namespace = useMemo(() => {
    const nsParam = searchParams.get("ns");
    return nsParam ? decodeURIComponent(nsParam) : undefined;
  }, [searchParams]);

  const closable = useMemo(() => {
    const closableParam = searchParams.get("closable");
    return closableParam !== undefined ? closableParam === "true" : undefined;
  }, [searchParams]);

  const visitor = useMemo(() => {
    const visitorParam = searchParams.get("visitor");
    return visitorParam !== undefined ? visitorParam === "true" : undefined;
  }, [searchParams]);

  return {
    project,
    namespace,
    closable,
    visitor,
  };
}
