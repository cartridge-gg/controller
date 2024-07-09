import { constants } from "starknet";
import { Container, Footer, Content } from "components/layout";
import { useCallback, useEffect, useState } from "react";
import { Status } from "utils/account";
import { Button, Link, Text, useInterval } from "@chakra-ui/react";
import { ExternalIcon, PacmanIcon } from "@cartridge/ui";
import { useController } from "hooks/controller";
import { ErrorAlert } from "./ErrorAlert";
import { Funding } from "./Funding";
import NextLink from "next/link";

export function DeploymentRequired({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { controller } = useController();
  const account = controller.account;
  const [status, setStatus] = useState<Status>(account.status);
  const [deployHash, setDeployHash] = useState<string>();
  const [error, setError] = useState<Error>();
  const [fundingRequired, setIsFundingRequired] = useState(false);

  const deployAccount = useCallback(async () => {
    try {
      const hash = await account.requestDeployment();
      setDeployHash(hash);
    } catch (e) {
      if (e.message.includes("account already deployed")) {
        account.status = Status.DEPLOYED;
      } else {
        setError(e);
      }
    }
  }, [account]);

  useEffect(() => {
    if (account.status === Status.DEPLOYED) {
      return;
    }

    if (account.chainId === constants.StarknetChainId.SN_MAIN) {
      setIsFundingRequired(true);
      return;
    }

    deployAccount();
  }, [account.chainId, deployAccount, account.status]);

  useInterval(async () => {
    if (account.status === Status.COUNTERFACTUAL) {
      if (deployHash) {
        await account.waitForTransaction(deployHash, { retryInterval: 1000 });
      }

      await account.sync();
      setStatus(account.status);
    }
  }, 1000);

  const fundingComplete = useCallback(async (deployHash) => {
    if (deployHash) setDeployHash(deployHash);
    setIsFundingRequired(false);
  }, []);

  if (fundingRequired) return <Funding onComplete={fundingComplete} />;

  if (status === Status.DEPLOYED) {
    return <>{children}</>;
  }

  return (
    <Container
      variant="connect"
      icon={<PacmanIcon color="brand.primary" fontSize="3xl" />}
      title="Deploying your account"
      description="This may take a second"
    >
      <Content alignItems="center">
        {status === Status.COUNTERFACTUAL &&
          deployHash &&
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
