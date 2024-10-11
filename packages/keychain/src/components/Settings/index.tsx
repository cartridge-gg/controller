import {
  Button,
  VStack,
  Text,
  HStack,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { Container, Content, Footer } from "components/layout";
import { GearIcon, TrashIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { useCallback, useEffect, useState } from "react";
import { useExternalOwners } from "hooks/external";
import { formatAddress } from "@cartridge/utils";
import { Recovery } from "./Recovery";
import { Delegate } from "./Delegate";
import { CallData } from "starknet";
import { ExecuteCtx } from "utils/connection";

enum State {
  SETTINGS,
  RECOVERY,
  DELEGATE,
}

export function Settings({ onLogout }: { onLogout: () => void }) {
  const { controller, context, setContext } = useConnection();
  const [state, setState] = useState<State>(State.SETTINGS);
  const [delegateAccount, setDelegateAccount] = useState("");

  useEffect(() => {
    const init = async () => {
      const delegate = await controller.delegateAccount();
      setDelegateAccount(delegate);
    };
    init();
  }, [controller]);

  const { externalOwners } = useExternalOwners();

  const onRemoveExternalOwner = useCallback(
    (externalOwnerAddress: string) => {
      setContext({
        origin: context.origin,
        transactions: [
          {
            contractAddress: controller.address,
            entrypoint: "remove_external_owner",
            calldata: CallData.compile([externalOwnerAddress]),
          },
        ],
        type: "execute",
        resolve: context.resolve,
        reject: context.reject,
      } as ExecuteCtx);
    },
    [controller, context, setContext],
  );

  const onRemoveDelegate = useCallback(() => {
    setContext({
      origin: context.origin,
      transactions: [
        {
          contractAddress: controller.address,
          entrypoint: "set_delegate_account",
          calldata: CallData.compile(["0x0"]),
        },
      ],
      type: "execute",
      resolve: context.resolve,
      reject: context.reject,
    } as ExecuteCtx);
  }, [controller, context, setContext]);

  if (state === State.RECOVERY) {
    return <Recovery onBack={() => setState(State.SETTINGS)} />;
  }

  if (state === State.DELEGATE) {
    return <Delegate onBack={() => setState(State.SETTINGS)} />;
  }

  return (
    <Container variant="settings" title="Controller Settings" Icon={GearIcon}>
      <Content>
        <VStack gap="30px" w="full">
          {/* <VStack>
            {controller.cartridge.hasSession(
              controller.cartridge.session(),
            ) ? (
              <Text>Session active</Text>
            ) : (
              <Text>No Session</Text>
            )}
           <Button
              onClick={() => {
                // zzz not implemented
                controller.cartridge.revokeSession();
              }}
            >
              Clear Session
            </Button> 
          </VStack> */}

          <VStack w="full" alignItems="flex-start">
            <Text fontWeight="bold" color="text.secondary">
              Recovery Account(s)
            </Text>
            <Text color="text.secondary" fontSize="sm">
              Controllers can be owned by an existing Starknet wallet. Setting a
              recovery account will allow you to recover a controller if you
              lose your passkey.
            </Text>

            <UnorderedList w="full" listStyleType="none" marginInlineStart={0}>
              {externalOwners.map((externalOwner) => {
                return (
                  <ListItem
                    w="full"
                    marginBottom="4px"
                    key={`ext-${externalOwner}`}
                  >
                    <HStack w="full">
                      <Text w="340px">
                        {" "}
                        {formatAddress(externalOwner, {
                          size: "lg",
                        })}{" "}
                      </Text>
                      <Button
                        onClick={() => onRemoveExternalOwner(externalOwner)}
                      >
                        <TrashIcon />
                      </Button>
                    </HStack>
                  </ListItem>
                );
              })}
            </UnorderedList>

            <Button w="full" onClick={() => setState(State.RECOVERY)}>
              Set Recovery Account
            </Button>
          </VStack>

          <VStack w="full" alignItems="flex-start">
            <Text fontWeight="bold" color="text.secondary">
              Delegate Account
            </Text>
            <Text color="text.secondary" fontSize="sm">
              You may optionally send rewards you earn in game to an external
              wallet.
            </Text>
            {delegateAccount && BigInt(delegateAccount) != 0n ? (
              <HStack w="full">
                <Text w="340px">
                  {" "}
                  {formatAddress(delegateAccount, { size: "lg" })}{" "}
                </Text>
                <Button onClick={() => onRemoveDelegate()}>
                  <TrashIcon />
                </Button>
              </HStack>
            ) : (
              <Button w="full" onClick={() => setState(State.DELEGATE)}>
                Set Delegate Account
              </Button>
            )}
          </VStack>
        </VStack>
      </Content>
      <Footer>
        <Button w="full" onClick={onLogout}>
          Log out
        </Button>
      </Footer>
    </Container>
  );
}
