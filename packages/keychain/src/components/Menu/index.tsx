import { Button } from "@chakra-ui/react";
import { Container, Content, Footer } from "components/layout";
import { CopyAddress } from "components/CopyAddress";
import { useConnection } from "hooks/connection";

export function Menu({ onLogout }: { onLogout: () => void }) {
  const { controller } = useConnection();
  return (
    <Container
      variant="menu"
      showSettings={true}
      title={controller.username}
      description={<CopyAddress address={controller.address} />}
    >
      <Content h="350px"></Content>
      <Footer hideTxSummary>
        <Button w="full" onClick={onLogout}>
          Log out
        </Button>
      </Footer>
    </Container>
  );
}
