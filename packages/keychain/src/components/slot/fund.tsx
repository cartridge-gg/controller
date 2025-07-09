import { useEffect } from "react";
import { Funding } from "../funding";
import Controller from "@/utils/controller";
import { useRouter, usePathname } from "expo-router";

export function Fund() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!Controller.fromStore(process.env.EXPO_PUBLIC_ORIGIN!)) {
      router.replace(`/slot?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [router, pathname]);

  return <Funding title="Fund Credits for Slot" isSlot />;
}
