import { constants } from "starknet";
import { Container, Footer, Content } from "components/layout";
import { useEffect, useState } from "react";
import { Button, Link } from "@chakra-ui/react";
import { ExternalIcon, PacmanIcon } from "@cartridge/ui";
import { useController } from "hooks/controller";
import { Funding } from "./Funding";
import { useConnection } from "hooks/connection";

export function DeploymentRequired({ onClose }: { onClose: () => void }) {
  const {
    controller: { account },
  } = useController();
  const { hasPrefundRequest } = useConnection();
  const [deployHash, setDeployHash] = useState<string>();
  const [showFunding, setShowFunding] = useState(true);

  useEffect(() => {
    if (
      account.chainId === constants.StarknetChainId.SN_MAIN ||
      hasPrefundRequest
    ) {
      setShowFunding(true);
      return;
    }
  }, [account.chainId, account.username, hasPrefundRequest]);

  if (showFunding)
    return (
      <Funding
        onComplete={(hash) => {
          if (hash) setDeployHash(hash);
          setShowFunding(false);
        }}
      />
    );

  return (
    <Container
      variant="connect"
      icon={<PacmanIcon color="brand.primary" fontSize="3xl" />}
      title="Deploying your account"
      description="This may take a second"
    >
      <Content alignItems="center">
        {deployHash &&
          [
            constants.StarknetChainId.SN_SEPOLIA,
            constants.StarknetChainId.SN_MAIN,
          ].includes(account.chainId as constants.StarknetChainId) && (
            <Link
              href={`https://${
                account.chainId === constants.StarknetChainId.SN_SEPOLIA
                  ? "sepolia."
                  : ""
              }starkscan.co/tx/${deployHash}`}
              isExternal
            >
              <Button variant="link" mt={10} rightIcon={<ExternalIcon />}>
                View on Starkscan
              </Button>
            </Link>
          )}
      </Content>
      <Footer>
        <Button onClick={onClose}>Close</Button>
      </Footer>
    </Container>
  );
}
