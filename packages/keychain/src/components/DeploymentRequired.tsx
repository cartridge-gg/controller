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
  const { isDeployed, deployRequest } = useDeploy();
  const [deployHash, setDeployHash] = useState<string>();
  const [error, setError] = useState<Error>();
  const [fundingRequired, setIsFundingRequired] = useState(false);

  useEffect(() => {
    if (isDeployed) {
      return;
    }

    if (account.chainId === constants.StarknetChainId.SN_MAIN) {
      setIsFundingRequired(true);
      return;
    }

    deployRequest(account.username)
      .then((hash) => {
        setDeployHash(hash);
      })
      .catch((e) => {
        if (!e.message.includes("account already deployed")) {
          setError(e);
        }
      });
  }, [account.chainId, account.username, isDeployed]);

  if (isDeployed) {
    return <>{children}</>;
  }

  if (fundingRequired)
    return (
      <Funding
        onComplete={(hash) => {
          if (hash) setDeployHash(hash);
          setIsFundingRequired(false);
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
                    href="https://discord.gg/cartridge"
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
