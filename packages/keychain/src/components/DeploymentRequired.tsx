import { constants } from "starknet";
import { Container, Footer, Content } from "components/layout";
import { useEffect, useState } from "react";
import { Status } from "utils/account";
import { Loading } from "./Loading";
import { Button, Link, Text } from "@chakra-ui/react";
import { ExternalIcon } from "@cartridge/ui";
import { useController } from "hooks/controller";

export function DeploymentRequired({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { controller } = useController()
  const account = controller.account;
  const [status, setStatus] = useState<Status>(account.status);
  const [deployHash, setDeployHash] = useState<string>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const fetch = async () => {
      try {
        switch (account.status) {
          case Status.COUNTERFACTUAL: {
            await account.requestDeployment();
            break;
          }
          case Status.DEPLOYING: {
            const hash = await account.getDeploymentTxn();

            if (hash) {
              setDeployHash(hash);
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
  }, [account]);

  useEffect(() => {
    const id = setInterval(async () => {
      if (account.status === Status.DEPLOYED) clearInterval(id);
      setStatus(account.status);
      await account.sync();
    }, 2000);

    return () => clearInterval(id);
  }, [account, setStatus]);

  if (status !== Status.DEPLOYED) {
    return (
      <Container
        Icon={Loading}
        title={"Deploying your account"}
        description="This may take a second"
      >
        <Content>
          {status === Status.DEPLOYING && (
            <Link
              href={`https://${account.chainId === constants.StarknetChainId.SN_SEPOLIA
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

          {error && (
            <>
              <Text>
                We encounter an account deployment error: {error.message}
              </Text>
              <Text>Please come by discord and report this issue.</Text>
            </>
          )}
        </Content>

        <Footer>
          <Button onClick={onClose}>close</Button>
        </Footer>
      </Container>
    );
  }

  return <>{children}</>;
}
