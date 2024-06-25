import { constants } from "starknet";
import { Container, Footer, Content } from "components/layout";
import { useEffect, useState } from "react";
import { Status } from "utils/account";
import { Button, Link, Text } from "@chakra-ui/react";
import { ExternalIcon, PacmanIcon } from "@cartridge/ui";
import { useController } from "hooks/controller";
import { ErrorAlert } from "./ErrorAlert";
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

  useEffect(() => {
    const fetch = async () => {
      try {
        switch (account.status) {
          case Status.COUNTERFACTUAL: {
            try {
              const hash = await account.requestDeployment();
              setDeployHash(hash);
            } catch (e) {
              if (e.message.includes("account already deployed")) {
                account.status = Status.DEPLOYED;
                await account.sync();
                setStatus(Status.DEPLOYED);
              } else {
                throw e;
              }
            }
            break;
          }
          case Status.DEPLOYED:
            return;
        }
      } catch (e) {
        setError(e);
      }
    };

    fetch();
  }, [account, setDeployHash]);

  useEffect(() => {
    const id = setInterval(async () => {
      if (account.status === Status.DEPLOYED) clearInterval(id);
      setStatus(account.status);
      await account.sync();
    }, 500);

    return () => clearInterval(id);
  }, [account, setStatus]);

  if (status !== Status.DEPLOYED) {
    return (
      <Container
        variant="connect"
        icon={<PacmanIcon color="brand.primary" fontSize="3xl" />}
        title={"Deploying your account"}
        description="This may take a second"
      >
        <Content alignItems="center">
          {status === Status.DEPLOYING &&
            account.chainId === constants.StarknetChainId.SN_SEPOLIA && (
              <Link
                href={`https://${
                  account.chainId === constants.StarknetChainId.SN_SEPOLIA
                    ? "sepolia."
                    : undefined
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

  return <>{children}</>;
}
