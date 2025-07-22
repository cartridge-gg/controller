import React, { PropsWithChildren } from "react";
import {
  LayoutContent,
  LayoutFooter,
  AlertIcon,
  ExternalIcon,
  Button,
  HeaderInner,
  LayoutContainer,
} from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { CARTRIDGE_DISCORD_LINK } from "@/constants";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { usePostHog } from "./provider/posthog";
import { NavigationHeader } from "./NavigationHeader";

export class ErrorBoundary extends React.Component<
  PropsWithChildren,
  { error?: Error }
> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <ErrorPage error={this.state.error} />;
    }

    return this.props.children;
  }
}

export function ErrorPage({ error }: { error: Error }) {
  const { closeModal } = useConnection();

  const posthog = usePostHog();

  useEffect(() => {
    posthog?.captureException(error, {
      source: "ErrorPage",
    });
  }, [error, posthog]);

  return (
    <div style={{ position: "relative" }}>
      <LayoutContainer>
        <NavigationHeader
          variant="hidden"
          forceShowClose
          onClose={closeModal}
        />
        <HeaderInner
          variant="expanded"
          title="We encountered an error"
          Icon={AlertIcon}
          hideIcon
        />
        <LayoutContent className="gap-4">
          <div className="flex w-full px-4 py-6 bg-background-200 border border-background-300 rounded">
            <p className="w-full text-sm">{error.message}</p>
          </div>

          <div className="flex items-center justify-between w-full px-4 py-6 bg-background-200 border border-background-300 rounded">
            <p className="text-sm font-semibold">Get help</p>

            <Link
              to={CARTRIDGE_DISCORD_LINK}
              target="_blank"
              className="flex items-center text-sm gap-2 hover:underline"
            >
              <div>Cartridge Discord</div>
              <ExternalIcon size="sm" />
            </Link>
          </div>
        </LayoutContent>

        <LayoutFooter>
          <Button variant="secondary" onClick={closeModal}>
            close
          </Button>
        </LayoutFooter>
      </LayoutContainer>
    </div>
  );
}
