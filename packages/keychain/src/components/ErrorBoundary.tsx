import React, { PropsWithChildren, useEffect } from "react";
import { Container, Content, Footer } from "./layout";
import { AlertIcon, ExternalIcon } from "@cartridge/ui-next";
import { Button, HStack, Link, Text } from "@chakra-ui/react";
import { useConnection } from "@/hooks/connection";
import { CARTRIDGE_DISCORD_LINK } from "@/const";
import { usePostHog } from "posthog-js/react";

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
      icon={<AlertIcon fontSize={48} />}
    >
      <Content gap={4}>
        <HStack
          bg="solid.primary"
          borderColor="solid.secondary"
          borderWidth={1}
          w="full"
          px={4}
          py={6}
          borderRadius="base"
        >
          <Text w="full" fontSize="sm">
            {error.message}
          </Text>
        </HStack>

        <HStack
          bg="solid.primary"
          borderColor="solid.secondary"
          borderWidth={1}
          w="full"
          px={4}
          py={6}
          borderRadius="base"
          justifyContent="space-between"
        >
          <Text fontSize="sm" fontWeight={600}>
            Get help
          </Text>

          <Link href={CARTRIDGE_DISCORD_LINK} isExternal>
            <HStack>
              <Text fontSize="sm">Cartridge Discord</Text>
              <ExternalIcon fontSize="xl" />
            </HStack>
          </Link>
        </HStack>
      </Content>

      <Footer>
        <Button onClick={closeModal}>close</Button>
      </Footer>
    </Container>
  );
}
