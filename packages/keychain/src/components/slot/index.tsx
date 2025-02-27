export { Consent } from "./consent";

import { PageLoading } from "#components/Loading";
import { CreateController } from "#components/connect";
import { useMeQuery } from "@cartridge/utils/api/cartridge";
import { useController } from "#hooks/controller";
import { useEffect } from "react";
import {
  Navigate,
  Outlet,
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
    case "/slot/consent":
    case "/slot/fund":
      return <Outlet />;
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
      const returnTo = searchParams.get("returnTo");
      const otherParams = Array.from(searchParams.entries())
        .filter(([key]) => key !== "returnTo")
        .reduce(
          (prev, [key, val], i) =>
            i === 0 ? `?${key}=${val}` : `${prev}&${key}=${val}`,
          "",
        );

      const target = returnTo
        ? `${returnTo}${otherParams}`
        : `/slot/consent${otherParams}`;
      navigate(target, { replace: true });
    }
  }, [user, controller, navigate, searchParams]);

  if (!isFetched) {
    return <PageLoading />;
  }

  return <CreateController isSlot={true} />;
}
