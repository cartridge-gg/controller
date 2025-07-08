import { useEffect } from "react";
import { Funding } from "../funding";
import Controller from "@/utils/controller";
import { useLocation, useNavigate } from "react-router-dom";

export function Fund() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!Controller.fromStore(process.env.EXPO_PUBLIC_ORIGIN!)) {
      navigate(`/slot?returnTo=${encodeURIComponent(pathname)}`, {
        replace: true,
      });
    }
  }, [navigate, pathname]);

  return <Funding title="Fund Credits for Slot" isSlot />;
}
