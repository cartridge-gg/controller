import { credentialToAddress } from "@/components/connect/types";
import { useNavigation } from "@/context/navigation";
import { useController } from "@/hooks/controller";
import { useWallets } from "@/hooks/wallets";
import { SmsWallet } from "@/wallets/social/sms-wallet";
import { OAuthWallet } from "@/wallets/social/turnkey";
import { WalletConnectWallet } from "@/wallets/wallet-connect";
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
  HeaderInner,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  MobileIcon,
  SignerMethod,
  SignerMethodKind,
  SignerPendingCard,
  SignerPendingCardKind,
  SpinnerIcon,
} from "@cartridge/ui";
import {
  ControllerQuery,
  CredentialMetadata,
} from "@cartridge/ui/utils/api/cartridge";
import { useCallback, useEffect, useMemo, useState } from "react";
import { QueryObserverResult } from "react-query";
import { SignerAlert } from "../signer-alert";

type SignerPending = {
  kind: SignerMethodKind;
  inProgress: boolean;
  error?: string;
  authedAddress?: string;
};

export function AddSigner({
  controllerQuery,
}: {
  controllerQuery: QueryObserverResult<ControllerQuery>;
}) {
  const { navigate } = useNavigation();
  const [wallets, setWallets] = useState<boolean>(false);
  const [signerPending, setSignerPending] = useState<SignerPending | null>(
    null,
  );
  const [HeaderIcon, setHeaderIcon] = useState<
    typeof MobileIcon | typeof SpinnerIcon
  >(AddUserIcon);

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
        setHeaderIcon(SpinnerIcon);

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
        const errorMessage =
          error instanceof Error || error instanceof JsControllerError
            ? error.message
            : "Unknown error";
        setSignerPending({
          kind: auth,
          inProgress: false,
          error: errorMessage,
        });
      }
    },
    [setSignerPending],
  );

  useEffect(() => {
    if (
      signerPending &&
      signerPending.inProgress === false &&
      !signerPending.error &&
      !signerPending.authedAddress
    ) {
      setTimeout(async () => {
        await controllerQuery.refetch();
        navigate("/settings");
      }, 2000);
    }
  }, [signerPending, signerPending?.inProgress, controllerQuery, navigate]);

  return (
    <LayoutContainer>
      <HeaderInner
        icon={<HeaderIcon size="lg" variant="solid" />}
        variant="compressed"
        title={`Add ${signerPending ? signerPending.kind : ""} Signer`}
      />
      <>
        <LayoutContent className="flex flex-col gap-3 w-full h-fit">
          {!signerPending && <SignerAlert />}
          {signerPending ? (
            <SignerPendingCard
              kind={signerPending.kind as SignerPendingCardKind}
              inProgress={signerPending.inProgress}
              error={signerPending.error}
              authedAddress={signerPending.authedAddress}
            />
          ) : wallets ? (
            <WalletAuths
              currentSigners={controllerQuery.data?.controller?.signers?.map(
                (signer) => signer.metadata as CredentialMetadata,
              )}
              handleClick={handleClick}
            />
          ) : (
            <RegularAuths
              setWallets={setWallets}
              currentSigners={controllerQuery.data?.controller?.signers?.map(
                (signer) => signer.metadata as CredentialMetadata,
              )}
              handleClick={handleClick}
            />
          )}
        </LayoutContent>

        <LayoutFooter>
          {(wallets || signerPending?.error) && (
            <Button
              variant="secondary"
              onClick={() => {
                if (signerPending?.error || signerPending?.authedAddress) {
                  setSignerPending(null);
                  setHeaderIcon(AddUserIcon);
                } else {
                  setWallets(false);
                }
              }}
            >
              Cancel
            </Button>
          )}
        </LayoutFooter>
      </>
    </LayoutContainer>
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

  const handleClickInner = useCallback(
    async (wallet: SignerMethodKind) => {
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

      if (
        currentSigners?.find(
          (signer) => credentialToAddress(signer) === response.account,
        )
      ) {
        return response.account;
      }
      await controller?.addOwner(signer!, signerInput!, null);
    },
    [currentSigners, controller],
  );

  return (
    <>
      {supportedWallets.map((wallet) => (
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
            if (
              !controller ||
              !controller?.username() ||
              !controller?.appId()
            ) {
              throw new Error(
                `Invalid data: username: ${controller?.username()} appId: ${controller?.appId()}`,
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

            const turnkeyWallet = new OAuthWallet("google");
            const response = await turnkeyWallet.connect(controller.username());
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

            const turnkeyWallet = new OAuthWallet("discord");
            const response = await turnkeyWallet.connect(controller.username());
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
      <SignerMethod
        kind="sms"
        onClick={async () => {
          if (!controller?.username()) {
            throw new Error("No username");
          }
          const smsWallet = new SmsWallet();
          const response = await smsWallet.connect(
            controller.username()!,
            "add-signer",
          );
          if (!response || !response.success || !response.account) {
            throw new Error(response?.error || "Wallet auth: unknown error");
          }
          if (response.error?.includes("Account mismatch")) {
            throw new Error("Account mismatch");
          }
          window.keychain_wallets?.addEmbeddedWallet(
            response.account,
            smsWallet as unknown as WalletAdapter,
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
                provider: "sms",
                eth_address: response.account,
              }),
            },
            null,
          );
        }}
      />
      <SignerMethod
        kind="wallet"
        onClick={() => {
          setWallets(true);
        }}
      />
    </>
  );
};
