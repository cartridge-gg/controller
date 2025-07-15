export { Consent } from "./consent";

import { PageLoading } from "@/components/Loading";
import { CreateController } from "@/components/connect";
import { useMeQuery } from "@cartridge/ui/utils/api/cartridge";
import { useController } from "@/hooks/controller";
import { useEffect } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { CheckIcon, HeaderInner, LayoutContent } from "@cartridge/ui";

export function Slot() {
  console.log("Slot");
  const { pathname } = useLocation();
  switch (pathname) {
    case "/slot/auth":
      return <Navigate to="/slot" replace />;
    case "/slot/auth/success":
      return <Success />;
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
  const {
    data: user,
    isFetched,
    refetch,
  } = useMeQuery(undefined, {
    retry: false,
    enabled: true,
  });

  console.log("[Slot Auth] Debug info:", {
    user,
    controller: !!controller,
    isFetched,
    searchParams: Object.fromEntries(searchParams.entries()),
  });

  useEffect(() => {
    console.log("[Slot Auth] useEffect triggered:", {
      hasUser: !!user,
      hasController: !!controller,
    });

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

      console.log("[Slot Auth] Navigating to:", target);
      navigate(target, { replace: true });
    }
  }, [user, controller, navigate, searchParams]);

  useEffect(() => {
    if (controller && isFetched && !user) {
      console.log("[Slot Auth] Controller set but no user, refetching...");
      refetch();
    }
  }, [controller, user, isFetched, refetch]);

  if (!isFetched) {
    console.log("[Slot Auth] Still fetching user data...");
    return <PageLoading />;
  }

  console.log("[Slot Auth] Showing CreateController (no user or controller)");
  return <CreateController isSlot={true} />;
}

export function Success() {
  return (
    <>
      <HeaderInner
        variant="expanded"
        Icon={CheckIcon}
        title="Success!"
        hideIcon
      />
      <LayoutContent className="gap-4">
        <div className="flex w-full px-4 py-5 bg-background-200 border border-background-300 rounded">
          <p className="w-full text-sm">
            You have successfully authenticated with Slot!
            <br />
            <br />
            You can now close this window and return to the terminal.
            <br />
            <br />
            For more information on using Slot, please refer to our{" "}
            <a
              href="https://docs.cartridge.gg/slot/getting-started#usage"
              className="underline hover:text-primary-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation
            </a>
          </p>
        </div>
      </LayoutContent>
    </>
  );
}
