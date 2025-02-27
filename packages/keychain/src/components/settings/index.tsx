import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Button,
  GearIcon,
  SignOutIcon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "@cartridge/ui-next";
import { useCallback, useState } from "react";
import { Recovery } from "./Recovery";
import { Delegate } from "./Delegate";
import { useConnection } from "@/hooks/connection";

enum State {
  SETTINGS,
  RECOVERY,
  DELEGATE,
}

export function Settings() {
  const { logout, closeModal } = useConnection();
  const [state, setState] = useState<State>(State.SETTINGS);

  const handleLogout = useCallback(() => {
    logout();
    closeModal();
  }, [logout, closeModal]);

  // const [delegateAccount, setDelegateAccount] = useState("");

  // useEffect(() => {
  //   const init = async () => {
  //     const delegate = await controller.delegateAccount();
  //     setDelegateAccount(delegate);
  //   };
  //   init();
  // }, [controller]);

  // const { externalOwners } = useExternalOwners();

  // const onRemoveExternalOwner = useCallback(
  //   (externalOwnerAddress: string) => {
  //     setContext({
  //       origin: context.origin,
  //       transactions: [
  //         {
  //           contractAddress: controller.address,
  //           entrypoint: "remove_external_owner",
  //           calldata: CallData.compile([externalOwnerAddress]),
  //         },
  //       ],
  //       type: "execute",
  //       resolve: context.resolve,
  //       reject: context.reject,
  //     } as ExecuteCtx);
  //   },
  //   [controller, context, setContext],
  // );

  // const onRemoveDelegate = useCallback(() => {
  //   setContext({
  //     origin: context.origin,
  //     transactions: [
  //       {
  //         contractAddress: controller.address,
  //         entrypoint: "set_delegate_account",
  //         calldata: CallData.compile(["0x0"]),
  //       },
  //     ],
  //     type: "execute",
  //     resolve: context.resolve,
  //     reject: context.reject,
  //   } as ExecuteCtx);
  // }, [controller, context, setContext]);

  if (state === State.RECOVERY) {
    return <Recovery onBack={() => setState(State.SETTINGS)} />;
  }

  if (state === State.DELEGATE) {
    return <Delegate onBack={() => setState(State.SETTINGS)} />;
  }

  return (
    <Sheet>
      <LayoutContainer>
        <LayoutHeader
          variant="compressed"
          title="Controller Settings"
          Icon={GearIcon}
          hideSettings
        />
        <LayoutContent className="gap-6">
          {/* <VStack gap="30px" w="full">
          <VStack>
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
          </VStack>

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
        </VStack> */}
        </LayoutContent>

        <LayoutFooter>
          <SheetTrigger asChild>
            <Button type="button" variant="secondary" className="gap-2">
              <SignOutIcon />
              <span>Log out</span>
            </Button>
          </SheetTrigger>
        </LayoutFooter>

        <SheetContent
          side="bottom"
          className="border-background-100 p-6 gap-6 rounded-t-xl"
          showClose={false}
        >
          <div className="flex flex-row items-center gap-3 mb-6">
            <Button variant="icon" size="icon" className="flex items-center justify-center">
              <SignOutIcon size="lg" />
            </Button>
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold text-foreground-100">
                Log Out
              </h3>
              <p className="text-xs font-normal text-foreground-300">
              Are you sure?
              </p>
            </div>
          </div>
          <SheetFooter className="flex flex-row items-center gap-4">
            <SheetClose asChild className="flex-1">
              <Button variant="secondary">Cancel</Button>
            </SheetClose>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="flex-1"
            >
              <span className="text-destructive-100">Log out</span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </LayoutContainer>
    </Sheet>
  );
}
