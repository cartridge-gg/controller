import React, { PropsWithChildren } from "react";
import { Container } from "./layout";
import { AlertIcon } from "@cartridge/ui";

export class ErrorBoundary extends React.Component<
  PropsWithChildren,
  { error?: Error }
> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.log({ error, errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <Container
          variant="error"
          title="Something went wrong"
          Icon={AlertIcon}
          description="Open console in DevTools for more details"
        />
      );
    }

    return this.props.children;
  }
}
