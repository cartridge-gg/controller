import {
  ArgentColorIcon,
  ArgentIcon,
  Button,
  Card,
  CardDescription,
  CheckIcon,
  CreditCardIcon,
  DepositIcon,
  EthereumIcon,
  InfoIcon,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  MetaMaskColorIcon,
  MetaMaskIcon,
  PhantomColorIcon,
  PhantomIcon,
  Separator,
  StarknetIcon,
  SolanaIcon,
} from "@cartridge/ui-next";
import { Balance, BalanceType } from "../Balance";
import { useCallback, useEffect, useState } from "react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ExternalPlatform, ExternalWallet } from "@cartridge/controller";
import useCryptoPayment from "@/hooks/payment";
import { useConnection } from "@/hooks/connection";
import { clusterApiUrl, Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction
} from "@solana/spl-token";

const WALLET_CONFIG = {
    argent: {
      icon: ArgentIcon,
      colorIcon: ArgentColorIcon,
      network: "Starknet",
      networkIcon: StarknetIcon,
      bgColor: "#FF875B",
    },
    metamask: {
      icon: MetaMaskIcon,
      colorIcon: MetaMaskColorIcon,
      network: "Ethereum",
      networkIcon: EthereumIcon,
      bgColor: "#E88A39",
    },
    phantom: {
      icon: PhantomIcon,
      colorIcon: PhantomColorIcon,
      network: "Solana",
      networkIcon: SolanaIcon,
      bgColor: "#AB9FF2",
    },
  } as const;

  export function CryptoCheckout({ selectedWallet, walletAddress, creditsAmount, onBack, onComplete }: { selectedWallet: ExternalWallet, walletAddress: string, creditsAmount: number, onBack: () => void, onComplete: () => void }) {
    const [error, setError] = useState<Error>();
    const { externalSendTransaction } = useConnection();
    const { createCryptoPayment } = useCryptoPayment();
    const [sendingTransaction, setSendingTransaction] = useState(false);
    
    const getInfo = (wallet?: ExternalWallet) => {
      if (!wallet) {
        return (
          <>
            Credits are used to pay for network activity. They are not tokens and
            cannot be transferred or refunded.
          </>
        );
      }
  
      const NetworkIcon = WALLET_CONFIG[wallet.type].networkIcon;
      return (
        <>
          Purchase funds on <NetworkIcon size="sm" className="inline-block" />{" "}
          {WALLET_CONFIG[wallet.type].network}
        </>
      );
    };

    const handleSendTransaction = useCallback(async () => {
      setSendingTransaction(true);

      try {    
        const connection = new Connection(clusterApiUrl("devnet"))    
        const { depositAddress, tokenAmount, tokenAddress } = await createCryptoPayment(creditsAmount, selectedWallet.platform!)

        const senderPublicKey = new PublicKey(walletAddress)
        const recipientPublicKey = new PublicKey(depositAddress)
        const tokenMint = new PublicKey(tokenAddress)
        
        const senderTokenAccount = await getAssociatedTokenAddress(
          tokenMint,
          senderPublicKey
        );

        const recipientTokenAccount = await getAssociatedTokenAddress(
          tokenMint,
          recipientPublicKey
        );

        const createAtaIx = createAssociatedTokenAccountInstruction(
          senderPublicKey, 
          recipientTokenAccount,
          recipientPublicKey,
          tokenMint
        );
        
        const transferInstruction = createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          new PublicKey(walletAddress),
          tokenAmount
        );

        const txn = new Transaction().add(
          createAtaIx,
          transferInstruction
        );
        txn.feePayer = senderPublicKey;
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        txn.recentBlockhash = blockhash;

        const serializedTxn = txn.serialize({requireAllSignatures: false}).toString('base64');
        const res = await externalSendTransaction(selectedWallet.type, serializedTxn);
        if (!res.success) {
          throw new Error(res.error);
        }

        const { signature } = res.result as { signature: string };

        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight
        });

        onComplete();
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setSendingTransaction(false);
      }
    }, [createCryptoPayment, selectedWallet, creditsAmount, onComplete]);

    return (
      <LayoutContainer>
      <LayoutHeader
        className="p-6"
        title={"Purchase Credits"}
        icon={<DepositIcon variant="solid" size="lg" />
        }
        onBack={() => onBack()}
      />
      <LayoutContent className="gap-6 px-6">
        <Balance types={[BalanceType.CREDITS]} />
      </LayoutContent>

      <div className="m-1 mx-6">
        <Separator className="bg-spacer" />
      </div>

      <LayoutFooter>
        {error && (
          <ErrorAlert
            variant="warning"
            title="Purchase Alert"
            description={error.message}
          />
        )}

        <Card className="bg-background-100 border border-background-200 p-3">
          <CardDescription className="flex flex-row items-start gap-3">
            <InfoIcon size="sm" className="text-foreground-200 flex-shrink-0" />
            <p className="text-foreground-200 font-normal text-xs">
              {getInfo(selectedWallet)}
            </p>
          </CardDescription>
        </Card>
        <Button
          className="flex-1 text-background-100 hover:brightness-90"
          variant="secondary"
          style={{
            backgroundColor: WALLET_CONFIG[selectedWallet!.type].bgColor,
            border: "none",
          }}
          isLoading={sendingTransaction}
          onClick={() => handleSendTransaction()}
        >
          {walletIcon(selectedWallet)}
          Purchase with {selectedWallet?.name}
        </Button>
      </LayoutFooter>
    </LayoutContainer>
    );
  }

  export const walletIcon = (wallet?: ExternalWallet, useColor = false) => {
    if (!wallet) {
      return null;
    }

    const Icon = useColor
      ? WALLET_CONFIG[wallet.type].colorIcon
      : WALLET_CONFIG[wallet.type].icon;
    return <Icon />;
  };
