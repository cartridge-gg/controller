import { credentialToAddress } from "@/components/connect/types";
import { useController } from "@/hooks/controller";
import { useWallets } from "@/hooks/wallets";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import {
  AuthOptions,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "@cartridge/controller";
import {
  JsControllerError,
  JsSignerInput,
  Signer,
} from "@cartridge/controller-wasm";
import {
  AddUserIcon,
  Button,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  SignerMethod,
  SignerMethodKind,
  SignerPendingCard,
  SignerPendingCardKind,
} from "@cartridge/ui";
import {
  ControllerQuery,
  CredentialMetadata,
} from "@cartridge/ui/utils/api/cartridge";
import { useCallback, useEffect, useMemo, useState } from "react";
import { QueryObserverResult } from "react-query";
import { SignerAlert } from "../signer-alert";
import { addWebauthnSigner } from "./webauthn";
import { WalletConnectWallet } from "@/wallets/wallet-connect";

type SignerPending = {
  kind: SignerMethodKind;
  inProgress: boolean;
  error?: string;
  authedAddress?: string;
};

export function AddSigner({
  onBack,
  controllerQuery,
}: {
  onBack: () => void;
  controllerQuery: QueryObserverResult<ControllerQuery>;
}) {
  const [wallets, setWallets] = useState<boolean>(false);
  const [signerPending, setSignerPending] = useState<SignerPending | null>(
    null,
  );

  useEffect(() => {
    if (
      signerPending &&
      signerPending.inProgress === false &&
      !signerPending.error
    ) {
      setTimeout(async () => {
        await controllerQuery.refetch();
        onBack();
      }, 2000);
    }
  }, [signerPending, signerPending?.inProgress]);

  return (
    <LayoutContainer>
      <LayoutHeader
        icon={<AddUserIcon />}
        variant="compressed"
        title="Add Signer"
        onBack={onBack}
        hideSettings
      />
      <LayoutContent className="flex flex-col gap-3 w-full h-fit">
        <SignerAlert />
        {signerPending ? (
          <SignerPendingCard
            kind={signerPending.kind as SignerPendingCardKind}
            inProgress={signerPending.inProgress}
            error={signerPending.error}
            authedAddress={signerPending.authedAddress}
          />
        ) : wallets ? (
          <WalletAuths
            setSignerPending={setSignerPending}
            currentSigners={controllerQuery.data?.controller?.signers?.map(
              (signer) => signer.metadata as CredentialMetadata,
            )}
          />
        ) : (
          <RegularAuths
            setWallets={setWallets}
            setSignerPending={setSignerPending}
            currentSigners={controllerQuery.data?.controller?.signers?.map(
              (signer) => signer.metadata as CredentialMetadata,
            )}
          />
        )}
      </LayoutContent>

      <LayoutFooter>
        {(wallets || signerPending?.error) && (
          <Button
            variant="secondary"
            onClick={() => {
              if (signerPending?.error) {
                setSignerPending(null);
              } else {
                setWallets(false);
              }
            }}
          >
            Cancel
          </Button>
        )}
      </LayoutFooter>
    </LayoutContainer>
  );
}

const WalletAuths = ({
  setSignerPending,
  currentSigners,
}: {
  setSignerPending: (signerPending: SignerPending | null) => void;
  currentSigners: CredentialMetadata[] | undefined;
}) => {
  const { wallets, connectWallet } = useWallets();
  const { controller } = useController();
  const supportedWallets = useMemo(
    () =>
      [
        ...wallets
          .filter(
            (wallet) => wallet.type !== "argent" && wallet.type !== "phantom",
          )
          .map((wallet) => wallet.type),
        "walletconnect",
      ] as AuthOptions,
    [wallets],
  );

  const handleClick = useCallback(async (wallet: SignerMethodKind) => {
    try {
      setSignerPending({
        kind: wallet as SignerMethodKind,
        inProgress: true,
      });

      let response: ExternalWalletResponse<unknown> | null = null;
      let signer: Signer | null = null;
      let signerInput: JsSignerInput | null = null;
      switch (wallet) {
        case "metamask":
        case "rabby": {
          response = await connectWallet(wallet as ExternalWalletType);
          if (!response || !response.success || !response.account) {
            throw new Error(response?.error || "Wallet auth: unknown error");
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
            throw new Error(response?.error || "Wallet auth: unknown error");
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

      if (response?.success && response.account) {
        if (
          currentSigners?.find(
            (signer) => credentialToAddress(signer) === response.account,
          )
        ) {
          setSignerPending({
            kind: wallet as SignerMethodKind,
            inProgress: false,
            authedAddress: response.account,
          });
          return;
        }

        await controller?.addOwner(signer!, signerInput!);
        setSignerPending({
          kind: wallet as SignerMethodKind,
          inProgress: false,
        });
      }
    } catch (error) {
      setSignerPending({
        kind: wallet as SignerMethodKind,
        inProgress: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, []);

  return (
    <>
      {supportedWallets.map((wallet) => (
        <SignerMethod
          key={wallet as string}
          kind={wallet as SignerMethodKind}
          onClick={() => handleClick(wallet as SignerMethodKind)}
        />
      ))}
    </>
  );
};

const RegularAuths = ({
  setWallets,
  setSignerPending,
  currentSigners,
}: {
  setWallets: (wallets: boolean) => void;
  setSignerPending: (signerPending: SignerPending | null) => void;
  currentSigners: CredentialMetadata[] | undefined;
}) => {
  const { controller } = useController();
  const handleClick = useCallback(
    async (kind: SignerMethodKind, addFn: () => Promise<void>) => {
      try {
        setSignerPending({
          kind,
          inProgress: true,
        });
        await addFn();
        setSignerPending({
          inProgress: false,
          kind,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : error instanceof JsControllerError
              ? error.message
              : "Unknown error";

        console.error(error);

        setSignerPending({
          kind,
          inProgress: false,
          error: errorMessage,
        });
      }
    },
    [setSignerPending],
  );

  return (
    <>
      <SignerMethod
        kind="passkey"
        onClick={async () => {
          await handleClick("passkey", async () => {
            await addWebauthnSigner(controller);
          });
        }}
      />
      {/* <SignerMethod
        kind="google"
        onClick={() => {}}
      /> */}
      <SignerMethod
        kind="discord"
        onClick={async () => {
          await handleClick("discord", async () => {
            if (!controller?.username()) {
              throw new Error("No username");
            }

            const turnkeyWallet = new TurnkeyWallet();
            const response = await turnkeyWallet.connect(controller.username());
            if (!response || !response.success || !response.account) {
              throw new Error(response?.error || "Wallet auth: unknown error");
            }
            if (response.error?.includes("Account mismatch")) {
              throw new Error("Account mismatch");
            }
            window.keychain_wallets?.addEmbeddedWallet(
              response.account,
              turnkeyWallet as WalletAdapter,
            );
            if (
              currentSigners?.find(
                (signer) => credentialToAddress(signer) === response.account,
              )
            ) {
              setSignerPending({
                kind: "discord",
                inProgress: false,
                authedAddress: response.account,
              });
              return;
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
