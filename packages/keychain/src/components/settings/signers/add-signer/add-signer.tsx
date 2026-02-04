import { credentialToAddress } from "@/components/connect/types";
import { useNavigation } from "@/context/navigation";
import { useController } from "@/hooks/controller";
import { useWallets } from "@/hooks/wallets";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { WalletConnectWallet } from "@/wallets/wallet-connect";
import {
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "@cartridge/controller";
import {
  JsAddSignerInput,
  JsControllerError,
  Signer,
} from "@cartridge/controller-wasm";
import {
  AddUserIcon,
  AlertIcon,
  Button,
  CheckIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
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
import { useCallback, useEffect, useState } from "react";
import { QueryObserverResult } from "react-query";
import { SignerAlert } from "../signer-alert";
import { ExternalWalletError } from "@/utils/errors";

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
  const [headerIcon, setHeaderIcon] = useState<React.ReactElement>(
    <AddUserIcon size="lg" />,
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

        setHeaderIcon(<SpinnerIcon className="animate-spin" size="lg" />);
        const alreadyOwner = await authFn(auth);
        setHeaderIcon(<CheckIcon size="lg" />);

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
        setHeaderIcon(<AlertIcon size="lg" />);
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
    <>
      <HeaderInner
        icon={headerIcon}
        variant="compressed"
        title={`Add ${signerPending?.kind ? `${signerPending.kind.charAt(0).toUpperCase() + signerPending.kind.slice(1)} ` : ""} Signer`}
      />
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
              setHeaderIcon(<AddUserIcon size="lg" />);
              if (signerPending?.error || signerPending?.authedAddress) {
                setSignerPending(null);
              } else {
                setWallets(false);
              }
            }}
          >
            Cancel
          </Button>
        )}
        {!wallets && !signerPending && (
          <Button variant="secondary" onClick={() => navigate("/settings")}>
            Back
          </Button>
        )}
      </LayoutFooter>
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
