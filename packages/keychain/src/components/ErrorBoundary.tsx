import React, { PropsWithChildren, useEffect } from "react";
import { Container, Content, Footer } from "./layout";
import { AlertIcon, ExternalIcon, Button } from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { CARTRIDGE_DISCORD_LINK } from "@/const";
import { usePostHog } from "posthog-js/react";
import { Link } from "react-router-dom";

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
    <Container
      variant="expanded"
      title="Uh oh!"
      description="Something went wrong"
      icon={<AlertIcon size="lg" />}
    >
      <Content className="gap-4">
        <div className="flex w-full px-4 py-6 bg-secondary border border-quaternary rounded">
          <p className="w-full text-sm">{error.message}</p>
        </div>

        <div className="flex items-center justify-between w-full px-4 py-6 bg-secondary border border-quaternary rounded">
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
      </Content>

      <Footer>
        <Button variant="secondary" onClick={closeModal}>
          close
        </Button>
      </Footer>
    </Container>
  );
}
