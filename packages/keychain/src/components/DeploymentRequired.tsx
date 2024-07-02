import { constants, shortString } from "starknet";
import { Container, Footer, Content } from "components/layout";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Status } from "utils/account";
import { Button, Link, Text } from "@chakra-ui/react";
import { ExternalIcon, PacmanIcon } from "@cartridge/ui";
import { useController } from "hooks/controller";
import { ErrorAlert } from "./ErrorAlert";
import NextLink from "next/link";
import { useConnection } from "hooks/connection";

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
  const [fundingRequired, setFundingRequired] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (account.chainId === constants.StarknetChainId.SN_MAIN) {
      setFundingRequired(true);
      return;
    }

    deployAccount();
  }, [account]);

  useEffect(() => {
    const checkStatus = () => {
      if (account.status === Status.DEPLOYED) {
        setStatus(Status.DEPLOYED);
        return true;
      }
      setStatus(account.status);
      return false;
    };

    const id = setInterval(() => {
      if (checkStatus()) clearInterval(id);
    }, 500);

    return () => clearInterval(id);
  }, [account]);

  const deployAccount = useCallback(async () => {
    try {
      const hash = await account.requestDeployment();
      setDeployHash(hash);
    } catch (e) {
      if (e.message.includes("account already deployed")) {
        account.status = Status.DEPLOYED;
        setStatus(Status.DEPLOYED);
      } else {
        setError(e);
      }
    }
  }, []);

  if (status === Status.DEPLOYED) {
    return <>{children}</>;
  }

  if (fundingRequired) return <Funding />;

  return (
    <Container
      variant="connect"
      icon={<PacmanIcon color="brand.primary" fontSize="3xl" />}
      title="Deploying your account"
      description="This may take a second"
    >
      <Content alignItems="center">
        {status === Status.COUNTERFACTUAL &&
          account.chainId === constants.StarknetChainId.SN_SEPOLIA && (
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
        <Button onClick={onClose}>close</Button>
      </Footer>
    </Container>
  );
}

const Funding = () => {
  const { controller } = useController();
  const { origin } = useConnection();
  const account = controller.account;
  const session = controller.session(origin);

  return (
    <Container variant="connect" title="Funding Required for Starknet Mainnet">
      <Footer>
        <Button
          onClick={async () => {
            console.log(
              await account.cartridge.deploySelf(
                shortString.encodeShortString(account.username),
                "0x228e91aad32f01b4c64a9d307352f67ea44d7e3fa88a90c9caf72423eed083c",
              ),
            );
          }}
        >
          Deploy
        </Button>
      </Footer>
    </Container>
  );
};
