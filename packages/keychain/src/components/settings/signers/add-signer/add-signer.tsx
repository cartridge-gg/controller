import { useCallback, useEffect, useState } from "react";
import { useController } from "@/hooks/controller";
import { useWallets } from "@/hooks/wallets";
import { credentialToAddress } from "@/components/connect/types";
import { SignerPendingDrawer } from "@/components/connect/create/SignerPendingDrawer";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { WalletConnectWallet } from "@/wallets/wallet-connect";
import {
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
  AuthOption,
} from "@cartridge/controller";
import { JsAddSignerInput, Signer } from "@cartridge/controller-wasm";
import {
  AddUserIcon,
  Button,
  Drawer,
  DrawerContent,
  SignerMethod,
  SignerMethodKind,
} from "@cartridge/controller-ui";
import {
  ControllerQuery,
  CredentialMetadata,
} from "@cartridge/controller-ui/utils/api/cartridge";
import { QueryObserverResult } from "react-query";
import { ExternalWalletError } from "@/utils/errors";
import { SignerAlert } from "../signer-alert";

type SignerPending = {
  kind: SignerMethodKind;
  inProgress: boolean;
  error?: string;
  authedAddress?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "Unknown error";
}

interface AddSignerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  controllerQuery: QueryObserverResult<ControllerQuery>;
}

export function AddSignerDrawer({
  isOpen,
  onClose,
  controllerQuery,
}: AddSignerDrawerProps) {
  const [wallets, setWallets] = useState<boolean>(false);
  const [signerPending, setSignerPending] = useState<SignerPending | null>(
    null,
  );

  const handleClick = useCallback(
    async (
      auth: SignerMethodKind,
      authFn: (auth: SignerMethodKind) => Promise<string | undefined>,
    ) => {
      try {
        setSignerPending({
          kind: auth,
          inProgress: true,
        });

        const alreadyOwner = await authFn(auth);

        if (alreadyOwner) {
          setSignerPending({
            kind: auth,
            inProgress: false,
            authedAddress: alreadyOwner,
          });
          return;
        }

        setSignerPending({
          kind: auth,
          inProgress: false,
        });
      } catch (error) {
        console.error(error);
        const errorMessage = getErrorMessage(error);
        setSignerPending({
          kind: auth,
          inProgress: false,
          error: errorMessage,
        });
      }
    },
    [setSignerPending],
  );

  const handleClose = useCallback(() => {
    setSignerPending(null);
    setWallets(false);
    onClose();
  }, [setSignerPending, setWallets, onClose]);

  useEffect(() => {
    if (
      signerPending &&
      signerPending.inProgress === false &&
      !signerPending.error &&
      !signerPending.authedAddress
    ) {
      const timer = setTimeout(async () => {
        await controllerQuery.refetch();
        handleClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [signerPending, controllerQuery, handleClose]);

  const isChooseOpen = isOpen && signerPending === null;
  const isPendingOpen = isOpen && signerPending !== null;

  return (
    <>
      <Drawer
        isOpen={isChooseOpen}
        onClose={() => {
          if (signerPending) return;
          handleClose();
        }}
      >
        <DrawerContent title="Add Signer" icon={<AddUserIcon />}>
          <div className="flex flex-col gap-3">
            <SignerAlert />
            {wallets ? (
              <>
                <WalletAuths
                  currentSigners={controllerQuery.data?.controller?.signers?.map(
                    (signer) => signer.metadata as CredentialMetadata,
                  )}
                  handleClick={handleClick}
                />
                <Button variant="secondary" onClick={() => setWallets(false)}>
                  Back
                </Button>
              </>
            ) : (
              <RegularAuths
                setWallets={setWallets}
                currentSigners={controllerQuery.data?.controller?.signers?.map(
                  (signer) => signer.metadata as CredentialMetadata,
                )}
                handleClick={handleClick}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <SignerPendingDrawer
        isOpen={isPendingOpen}
        isLoading={signerPending?.inProgress ?? false}
        error={
          signerPending?.error ? new Error(signerPending.error) : undefined
        }
        authenticationMode={signerPending?.kind as AuthOption | undefined}
        onClose={handleClose}
      />
    </>
  );
}

const WalletAuths = ({
  currentSigners,
  handleClick,
}: {
  currentSigners: CredentialMetadata[] | undefined;
  handleClick: (
    auth: SignerMethodKind,
    authFn: (auth: SignerMethodKind) => Promise<string | undefined>,
  ) => void;
}) => {
  const { supportedWalletsForAuth, connectWallet } = useWallets();
  const { controller } = useController();

  const handleClickInner = useCallback(
    async (wallet: SignerMethodKind) => {
      let response: ExternalWalletResponse<unknown> | null = null;
      let signer: Signer | null = null;
      let signerInput: JsAddSignerInput | null = null;
      switch (wallet) {
        case "metamask":
        case "rabby": {
          response = await connectWallet(wallet as ExternalWalletType);
          if (!response || !response.success || !response.account) {
            throw new ExternalWalletError(
              response?.error || "Wallet auth: unknown error",
            );
          }
          signer = { eip191: { address: response.account } };
          signerInput = {
            type: "eip191",
            credential: JSON.stringify({
              provider: wallet,
              eth_address: response.account,
            }),
          };
          break;
        }
        case "phantom":
        case "argent": {
          throw new Error("Wallet not supported");
        }
        case "walletconnect": {
          const walletConnectWallet = new WalletConnectWallet();
          if (!walletConnectWallet) {
            throw new Error("Keychain wallets not found");
          }
          response = await walletConnectWallet.connect();
          if (!response || !response.success || !response.account) {
            throw new ExternalWalletError(
              response?.error || "Wallet auth: unknown error",
            );
          }
          window.keychain_wallets?.addEmbeddedWallet(
            response.account,
            walletConnectWallet,
          );
          signer = { eip191: { address: response.account } };
          signerInput = {
            type: "eip191",
            credential: JSON.stringify({
              provider: wallet,
              eth_address: response.account,
            }),
          };
          break;
        }

        default:
          throw new Error("Wallet not supported");
      }

      if (
        currentSigners?.find(
          (signer) => credentialToAddress(signer) === response.account,
        )
      ) {
        return response.account;
      }
      await controller?.addOwner(signer!, signerInput!, null);
    },
    [currentSigners, controller, connectWallet],
  );

  return (
    <>
      {[...supportedWalletsForAuth, "walletconnect"].map((wallet) => (
        <SignerMethod
          key={wallet as string}
          kind={wallet as SignerMethodKind}
          onClick={() =>
            handleClick(wallet as SignerMethodKind, handleClickInner)
          }
        />
      ))}
    </>
  );
};

const RegularAuths = ({
  setWallets,
  currentSigners,
  handleClick,
}: {
  setWallets: (wallets: boolean) => void;
  currentSigners: CredentialMetadata[] | undefined;
  handleClick: (
    auth: SignerMethodKind,
    authFn: (auth: SignerMethodKind) => Promise<string | undefined>,
  ) => void;
}) => {
  const { controller } = useController();

  return (
    <>
      <SignerMethod
        kind="passkey"
        onClick={async () => {
          await handleClick("passkey", async () => {
            if (!controller || !controller?.username()) {
              throw new Error(
                `Invalid data: username: ${controller?.username()}`,
              );
            }

            await controller.addOwner(null, null, import.meta.env.VITE_RP_ID);

            return undefined;
          });
        }}
      />
      <SignerMethod
        kind="google"
        onClick={async () => {
          await handleClick("google", async () => {
            if (!controller?.username()) {
              throw new Error("No username");
            }

            const turnkeyWallet = new TurnkeyWallet(
              controller.username(),
              controller.chainId(),
              controller.rpcUrl(),
              "google",
            );
            const response = await turnkeyWallet.connect(false);
            if (!response || !response.success || !response.account) {
              throw new Error(response?.error || "Wallet auth: unknown error");
            }
            if (response.error?.includes("Account mismatch")) {
              throw new Error("Account mismatch");
            }
            window.keychain_wallets?.addEmbeddedWallet(
              response.account,
              turnkeyWallet as unknown as WalletAdapter,
            );
            if (
              currentSigners?.find(
                (signer) => credentialToAddress(signer) === response.account,
              )
            ) {
              return response.account;
            }

            await controller?.addOwner(
              { eip191: { address: response.account } },
              {
                type: "eip191",
                credential: JSON.stringify({
                  provider: "google",
                  eth_address: response.account,
                }),
              },
              null,
            );
          });
        }}
      />
      <SignerMethod
        kind="discord"
        onClick={async () => {
          await handleClick("discord", async () => {
            if (!controller?.username()) {
              throw new Error("No username");
            }

            const turnkeyWallet = new TurnkeyWallet(
              controller.username(),
              controller.chainId(),
              controller.rpcUrl(),
              "discord",
            );
            const response = await turnkeyWallet.connect(false);
            if (!response || !response.success || !response.account) {
              throw new Error(response?.error || "Wallet auth: unknown error");
            }
            if (response.error?.includes("Account mismatch")) {
              throw new Error("Account mismatch");
            }
            window.keychain_wallets?.addEmbeddedWallet(
              response.account,
              turnkeyWallet as unknown as WalletAdapter,
            );
            if (
              currentSigners?.find(
                (signer) => credentialToAddress(signer) === response.account,
              )
            ) {
              return response.account;
            }
            await controller?.addOwner(
              { eip191: { address: response.account } },
              {
                type: "eip191",
                credential: JSON.stringify({
                  provider: "discord",
                  eth_address: response.account,
                }),
              },
              null,
            );
          });
        }}
      />
      {/* <SignerMethod
        kind="SMS"
        onClick={() => {}}
      /> */}
      <SignerMethod
        kind="wallet"
        onClick={() => {
          setWallets(true);
        }}
      />
    </>
  );
};
