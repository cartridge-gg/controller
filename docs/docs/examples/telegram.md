# Telegram

## Controller integration

1.  We generate a local Stark key pair for the user and store the private key in Telegrams cloud storage.
2.  We open the session controller page, passing the user's public key.
3.  The controller registers the session public key and returns account information.
4.  We create a controller session account on the client.
5.  We store the account information in Telegrams cloud storage.

## Using the useAccount Hook

The `useAccount` hook provides an easy way to integrate the controller into your Telegram Mini App.

1.  Define the `useAccount` hook:

    ```typescript
    import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
    import { useCloudStorage, useLaunchParams, useMiniApp, useUtils } from "@telegram-apps/sdk-react";
    import * as Dojo from "@dojoengine/torii-wasm";
    import encodeUrl from "encodeurl";
    import { CartridgeSessionAccount } from "@/lib/account-wasm"

    const RPC_URL =
    "https://api.cartridge.gg/x/starknet/mainnet";
    const KEYCHAIN_URL = "https://x.cartridge.gg";
    const POLICIES = [
    {
        target:
        "0x70fc96f845e393c732a468b6b6b54d876bd1a29e41a026e8b13579bf98eec8f",
        method: "attack",
        description: "Attack the beast",
    },
    {
        target:
        "0x70fc96f845e393c732a468b6b6b54d876bd1a29e41a026e8b13579bf98eec8f",
        method: "claim",
        description: "Claim your tokens",
    },
    ];
    const REDIRECT_URI = "https://t.me/hitthingbot/hitthing";

    interface AccountStorage {
    username: string;
    address: string;
    ownerGuid: string;
    transactionHash?: string;
    expiresAt: string;
    }

    interface SessionSigner {
    privateKey: string;
    publicKey: string;
    }

    interface AccountContextType {
    accountStorage: AccountStorage | undefined;
    sessionSigner: SessionSigner | undefined;
    account: CartridgeSessionAccount | undefined;
    openConnectionPage: () => void;
    clearSession: () => void;
    address: string | undefined;
    username: string | undefined;
    }

    const AccountContext = createContext<AccountContextType | undefined>(undefined);

    export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { initData } = useLaunchParams();
    const storage = useCloudStorage();
    const utils = useUtils();
    const miniApp = useMiniApp();

    const [accountStorage, setAccountStorage] = useState<AccountStorage>();
    const [sessionSigner, setSessionSigner] = useState<SessionSigner>();

    useEffect(() => {
        storage.get("sessionSigner").then((signer) => {
        if (signer) return setSessionSigner(JSON.parse(signer) as SessionSigner);

        const privateKey = Dojo.signingKeyNew();
        const publicKey = Dojo.verifyingKeyNew(privateKey);

        const newSigner = { privateKey, publicKey };
        storage.set("sessionSigner", JSON.stringify(newSigner));
        setSessionSigner(newSigner);
        });

        storage.get("account").then((account) => {
        if (account) {
            const parsedAccount = JSON.parse(account) as AccountStorage;
            if (!parsedAccount.address || !parsedAccount.ownerGuid || !parsedAccount.expiresAt) {
            return storage.delete("account");
            }
            setAccountStorage(parsedAccount);
        }
        });
    }, [storage]);

    useEffect(() => {
        if (!initData?.startParam) return;

        const cartridgeAccount = JSON.parse(atob(initData.startParam)) as AccountStorage;
        storage.set("account", JSON.stringify(cartridgeAccount));
        setAccountStorage(cartridgeAccount);
    }, [initData, storage]);

    const account = useMemo(() => {
        if (!accountStorage || !sessionSigner) return;

        return CartridgeSessionAccount.new_as_registered(
        RPC_URL,
        sessionSigner.privateKey,
        accountStorage.address,
        accountStorage.ownerGuid,
        Dojo.cairoShortStringToFelt("SN_MAINNET"),
        {
            expiresAt: Number(accountStorage.expiresAt),
            policies: POLICIES,
        }
        );
    }, [accountStorage, sessionSigner]);

    const openConnectionPage = () => {
        if (!sessionSigner) {
        const privateKey = Dojo.signingKeyNew();
        const publicKey = Dojo.verifyingKeyNew(privateKey);

        const newSigner = { privateKey, publicKey };
        storage.set("sessionSigner", JSON.stringify(newSigner));
        setSessionSigner(newSigner);
        return;
        }
        
        utils.openLink(
        encodeUrl(
            `${KEYCHAIN_URL}/session?public_key=${sessionSigner.publicKey}&redirect_uri=${REDIRECT_URI}&redirect_query_name=startapp&policies=${JSON.stringify(POLICIES)}&rpc_url=${RPC_URL}`
        )
        );
        miniApp.close();
    };

    const clearSession = () => {
        storage.delete("sessionSigner");
        storage.delete("account");
        setSessionSigner(undefined);
        setAccountStorage(undefined);
    };

    const value = {
        accountStorage,
        sessionSigner,
        account,
        openConnectionPage,
        clearSession,
        address: accountStorage?.address,
        username: accountStorage?.username,
    };

    return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
    };

    export const useAccount = () => {
    const context = useContext(AccountContext);
    if (context === undefined) {
        throw new Error('useAccount must be used within an AccountProvider');
    }
    return context;
    };
    ```

    ```

    ```

2.  Use the hook in your component:

    ```javascript
    function MyComponent() {
      const {
        accountStorage,
        sessionSigner,
        account,
        openConnectionPage,
        clearSession,
        address,
        username,
      } = useAccount();

      // Use the account information and functions as needed
    }
    ```

3.  Available properties and functions:

    -   `accountStorage`: Contains user account information (username, address, ownerGuid)
    -   `sessionSigner`: Contains the session's private and public keys
    -   `account`: The CartridgeSessionAccount instance
    -   `openConnectionPage()`: Function to open the connection page for account setup
    -   `clearSession()`: Function to clear the current session
    -   `address`: The user's account address
    -   `username`: The user's username

4.  Ensure your app is wrapped with the AccountProvider:

    ```javascript
    import { AccountProvider } from "./path/to/AccountProvider";

    function App() {
      return <AccountProvider>{/* Your app components */}</AccountProvider>;
    }
    ```

5.  Connecting to the controller

    ```javascript
    const { openConnectionPage } = useAccount();
    openConnectionPage();
    ```

## Dojo integration

2.  We create a Torii client in the main App component:

    ```javascript
    const [client, setClient] = useState<ToriiClient | undefined>();

    useEffect(() => {
      createClient({
        toriiUrl: TORII_URL,
        rpcUrl: RPC_URL,
        relayUrl: RELAY_URL,
        worldAddress: WORLD_ADDRESS,
      }).then(setClient);
    }, []);
    ```

3.  We subscribe to our game entities

    ```javascript
    const entities = await client.getEntities({
      limit: 1,
      offset: 0,
      clause: {
        Keys: {
          keys: ["0xfea4"], // or [address] for warrior
          models: ["beastslayers-Game"], // or ["beastslayers-Warrior"]
          pattern_matching: "FixedLen",
        },
      },
    });

    subscription.current = await client.onEntityUpdated(
      [{ HashedKeys: Object.keys(entities) }],
      (_hashedKeys, models) => {
        // Update local state based on the new data
      }
    );
    ```

4.  We refresh the react state to update the UI

    ```javascript
    const game = Object.values(entities)[0]["beastslayers-Game"];
    updateBeast(game);
    ```
