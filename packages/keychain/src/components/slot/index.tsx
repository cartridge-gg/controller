export { Consent } from "./consent";

import { PageLoading } from "@/components/Loading";
import { useMeQuery } from "@cartridge/ui/utils/api/cartridge";
import { useEffect } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { CheckIcon, HeaderInner, LayoutContent } from "@cartridge/ui";
import { useNavigation } from "@/context/navigation";
import { useConnection } from "@/hooks/connection";

export function Slot() {
  return <Outlet />;
}

export function Auth() {
  const { navigate } = useNavigation();
  const [searchParams] = useSearchParams();
  const { logout, controller } = useConnection();
  const { data: user, isFetched } = useMeQuery(undefined, {
    retry: false,
    enabled: true,
  });

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
  }, [user, isFetched, controller, navigate, searchParams]);

  // Logout to send user back to login
  useEffect(() => {
    if (controller && isFetched && !user) {
      logout();
    }
  }, [controller, user, isFetched, logout]);

  return <PageLoading />;
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
