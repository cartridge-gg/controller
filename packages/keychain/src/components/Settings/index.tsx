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
import { useEffect, useState } from "react";
import { useExternalOwners } from "hooks/external";
import { formatAddress } from "@cartridge/utils";

export function Settings({ onLogout }: { onLogout: () => void }) {
  const {
    context,
    controller,
    openMenu,
    setDelegate,
    setExternalOwner,
    setDelegateTransaction,
    removeExternalOwnerTransaction,
  } = useConnection();

  const [delegateAccount, setDelegateAccount] = useState("");

  useEffect(() => {
    const init = async () => {
      const delegate = await controller.delegateAccount();
      setDelegateAccount(delegate);
    };
    init();
  }, [controller]);

  const { externalOwners } = useExternalOwners();

  return (
    <Container
      variant="menu"
      title="Controller Settings"
      onBack={() => openMenu(context)}
      Icon={GearIcon}
    >
      <Content>
        <VStack gap="30px" w="full">
          {/* <VStack>
            {controller.account.cartridge.hasSession(
              controller.account.cartridge.session(),
            ) ? (
              <Text>Session active</Text>
            ) : (
              <Text>No Session</Text>
            )}
           <Button
              onClick={() => {
                // zzz not implemented
                controller.account.cartridge.revokeSession();
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
                        onClick={() => {
                          removeExternalOwnerTransaction(
                            context,
                            externalOwner,
                          );
                        }}
                      >
                        <TrashIcon />
                      </Button>
                    </HStack>
                  </ListItem>
                );
              })}
            </UnorderedList>

            <Button w="full" onClick={() => setExternalOwner(context)}>
              Add Recovery Account
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
                <Button
                  onClick={() => {
                    setDelegateTransaction(context, "0x0");
                  }}
                >
                  <TrashIcon />
                </Button>
              </HStack>
            ) : (
              <Button w="full" onClick={() => setDelegate(context)}>
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
