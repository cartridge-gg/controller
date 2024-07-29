import { constants } from "starknet";
import { Container, Footer, Content } from "components/layout";
import { useEffect, useState } from "react";
import { Button, Link, Text } from "@chakra-ui/react";
import { ExternalIcon, PacmanIcon } from "@cartridge/ui";
import { useController } from "hooks/controller";
import { ErrorAlert } from "./ErrorAlert";
import { Funding } from "./Funding";
import NextLink from "next/link";
import { useDeploy } from "hooks/deploy";
import { useConnection } from "hooks/connection";
import { CARTRIDGE_DISCORD_LINK } from "const";

export function DeploymentRequired({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  const {
    controller: { account },
  } = useController();
  const { hasPrefundRequest } = useConnection();
  const { deployRequest, isDeployed } = useDeploy();
  const [deployHash, setDeployHash] = useState<string>();
  const [showFunding, setShowFunding] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (isDeployed) {
      return;
    }

    if (
      account.chainId === constants.StarknetChainId.SN_MAIN ||
      hasPrefundRequest
    ) {
      setShowFunding(true);
      return;
    }

    deployRequest(account.username)
      .then((hash) => {
        setDeployHash(hash);
      })
      .catch((e) => setError(e));
  }, [account.chainId, account.username]);

  if (isDeployed) {
    return <>{children}</>;
  }

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
        {error && (
          <ErrorAlert
            title="Account deployment error"
            description={
              <>
                <Text mb={4} color="inherit">
                  Please come by{" "}
                  <Link
                    as={NextLink}
                    href={CARTRIDGE_DISCORD_LINK}
                    isExternal
                    color="link.blue"
                    display="inline-flex"
                    flexDir="row"
                    columnGap="0.1rem"
                    alignItems="center"
                  >
                    Discord
                    <ExternalIcon />
                  </Link>{" "}
                  and report this issue.
                </Text>
                <Text color="text.secondary">{error.message}</Text>
              </>
            }
          />
        )}
        <Button onClick={onClose}>Close</Button>
      </Footer>
    </Container>
  );
}
