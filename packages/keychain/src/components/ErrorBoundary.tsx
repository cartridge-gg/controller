import React, { PropsWithChildren } from "react";
import { Container, Content, Footer } from "./layout";
import { AlertIcon, ExternalIcon } from "@cartridge/ui";
import { Button, HStack, Link, Text } from "@chakra-ui/react";
import { useConnection } from "hooks/connection";
import NextLink from "next/link";
import { CARTRIDGE_DISCORD_LINK } from "const";

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
      return <ErrorPage error={this.state.error} />;
    }

    return this.props.children;
  }
}

export function ErrorPage({ error }: { error: Error }) {
  const { closeModal } = useConnection();

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

          <Link as={NextLink} href={CARTRIDGE_DISCORD_LINK} isExternal>
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
