export { Consent } from "./consent";

import { PageLoading } from "@/components/Loading";
import { CreateController } from "@/components/connect";
import { useMeQuery } from "@cartridge/ui/utils/api/cartridge";
import { useController } from "@/hooks/controller";
import { useEffect } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  CheckIcon,
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@cartridge/ui";

export function Slot() {
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
  const { data: user, isFetched } = useMeQuery(undefined, { retry: false });

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

function Success() {
  return (
    <LayoutContainer className="pb-12">
      <LayoutHeader
        variant="expanded"
        Icon={CheckIcon}
        title="Success!"
        hideNetwork
      />
      <LayoutContent className="gap-4">
        <div className="flex w-full px-4 py-6 bg-background-200 border border-background-300 rounded">
          <p className="w-full text-sm">
            You have successfully authenticated with Slot.
            <br />
            You can now close this window and return to the terminal.
            <br />
            <br />
            For more information on using Slot, please refer to our{" "}
            <Link
              to="https://docs.cartridge.gg/slot/getting-started#usage"
              target="_blank"
            >
              documentation
            </Link>
          </p>
        </div>
      </LayoutContent>
    </LayoutContainer>
  );
}
