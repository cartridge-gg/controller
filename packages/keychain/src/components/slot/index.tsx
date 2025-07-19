export { Consent } from "./consent";

import { PageLoading } from "@/components/Loading";
import { CreateController } from "@/components/connect";
import { useMeQuery } from "@cartridge/ui/utils/api/cartridge";
import { useController } from "@/hooks/controller";
import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  CheckIcon,
  CloneIcon,
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
  Button,
} from "@cartridge/ui";

export function Slot() {
  const { pathname, search } = useLocation();
  switch (pathname) {
    case "/slot/auth":
      return <Navigate to="/slot" replace />;
    case "/slot/auth/success":
      return <Success />;
    case "/slot/auth/failure":
      // Preserve OAuth error parameters when redirecting to failure page
      return <Navigate to={`/failure${search}`} replace />;
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

export function Success() {
  const [searchParams] = useSearchParams();
  const [copyCodeClicked, setCopyCodeClicked] = useState(false);
  const authCode = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (copyCodeClicked) {
      timeoutId = setTimeout(() => {
        setCopyCodeClicked(false);
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [copyCodeClicked]);

  const handleCopyCode = () => {
    if (authCode) {
      navigator.clipboard.writeText(authCode);
      setCopyCodeClicked(true);
    }
  };

  // Show error state
  if (error) {
    return (
      <LayoutContainer className="pb-12">
        <LayoutHeader
          variant="expanded"
          title="Authentication Failed"
          hideNetwork
        />
        <LayoutContent className="gap-4">
          <div className="flex w-full px-4 py-5 bg-background-200 border border-background-300 rounded">
            <p className="w-full text-sm">
              Authentication failed: {errorDescription || error}
              <br />
              <br />
              Please return to the terminal and try again.
            </p>
          </div>
        </LayoutContent>
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer className="pb-12">
      <LayoutHeader
        variant="expanded"
        Icon={CheckIcon}
        title="Success!"
        hideNetwork
      />
      <LayoutContent className="gap-4">
        <div className="flex w-full px-4 py-5 bg-background-200 border border-background-300 rounded">
          <p className="w-full text-sm">
            You have successfully authenticated with Slot!
            <br />
            <br />
            {authCode ? (
              <>
                If the browser redirect failed or you're in a headless
                environment, copy the authorization code below and paste it into
                your terminal:
              </>
            ) : (
              <>You can now close this window and return to the terminal.</>
            )}
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

        {authCode && (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-foreground-200 px-1">
              Authorization Code
            </div>
            <div className="flex w-full bg-background-200 border border-background-300 rounded overflow-hidden">
              <div className="flex-1 px-4 py-3 font-mono text-sm break-all">
                {authCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="m-2 relative"
                onClick={handleCopyCode}
              >
                <div
                  className={`absolute inset-0 flex items-center justify-center ${
                    copyCodeClicked
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  } transition-opacity duration-200 ease-in-out`}
                >
                  Copied!
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    copyCodeClicked
                      ? "opacity-0 pointer-events-none"
                      : "opacity-100"
                  } transition-opacity duration-200 ease-in-out`}
                >
                  <CloneIcon variant="line" size="sm" />
                  Copy
                </div>
              </Button>
            </div>
          </div>
        )}
      </LayoutContent>
    </LayoutContainer>
  );
}
