export { Consent } from "./consent";

import { PageLoading } from "@/components/Loading";
import { CreateController } from "@/components/connect";
import { useMeQuery } from "@cartridge/utils/api/cartridge";
import { useController } from "@/hooks/controller";
import { useEffect } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

export function Slot() {
  const { pathname } = useLocation();
  switch (pathname) {
    case "/slot/auth":
      return <Navigate to="/slot" replace />;
    case "/slot/auth/success":
      return <Navigate to="/success" replace />;
    case "/slot/auth/failure":
      return <Navigate to="/failure" replace />;
    default:
      return <Auth />;
  }
}

function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { controller } = useController();
  const { data: user, isFetched } = useMeQuery();

  useEffect(() => {
    if (user && controller) {
      const query = Array.from(searchParams.entries()).reduce(
        (prev, [key, val], i) =>
          i === 0 ? `?${key}=${val}` : `${prev}&${key}=${val}`,
        "",
      );

      navigate(`/slot/consent${query}`, { replace: true });
    }
  }, [user, controller, navigate, searchParams]);

  if (!isFetched) {
    return <PageLoading />;
  }

  return <CreateController isSlot={true} />;
}