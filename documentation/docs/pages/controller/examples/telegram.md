# Telegram

## Controller Integration Flow

1. Generate local Stark key pair and store private key in Telegram cloud storage
2. Open session controller page with user's public key
3. Controller registers session public key and returns account info
4. Create controller session account on client
5. Store account info in Telegram cloud storage

---

## Define the useAccount Hook

The `useAccount` hook provides an easy way to integrate the controller into your Telegram Mini App.

### 1. Define the `useAccount` hook:

```typescript
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
} from "react";
import {
    useCloudStorage,
    useLaunchParams,
    useMiniApp,
    useUtils,
} from "@telegram-apps/sdk-react";
import * as Dojo from "@dojoengine/torii-wasm";
import encodeUrl from "encodeurl";
import { CartridgeSessionAccount } from "@/lib/account-wasm";

const RPC_URL = "https://api.cartridge.gg/x/starknet/mainnet";
const KEYCHAIN_URL = "https://x.cartridge.gg";
const POLICIES = [
    {
        target: "0x70fc96f845e393c732a468b6b6b54d876bd1a29e41a026e8b13579bf98eec8f",
        method: "attack",
        description: "Attack the beast",
    },
    {
        target: "0x70fc96f845e393c732a468b6b6b54d876bd1a29e41a026e8b13579bf98eec8f",
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

// AccountProvider component that manages account state and session handling
export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    // Get Telegram Mini App launch parameters and utilities
    const { initData } = useLaunchParams();
    const storage = useCloudStorage();
    const utils = useUtils();
    const miniApp = useMiniApp();

    // State for storing account and session information
    const [accountStorage, setAccountStorage] = useState<AccountStorage>();
    const [sessionSigner, setSessionSigner] = useState<SessionSigner>();

    // Effect to initialize session signer and load stored account data
    useEffect(() => {
        // Try to load existing session signer from storage
        storage.get("sessionSigner").then((signer) => {
            if (signer) {
                return setSessionSigner(JSON.parse(signer) as SessionSigner);
            }

            // If no signer exists, create new key pair
            const privateKey = Dojo.signingKeyNew();
            const publicKey = Dojo.verifyingKeyNew(privateKey);

            const newSigner = { privateKey, publicKey };
            storage.set("sessionSigner", JSON.stringify(newSigner));
            setSessionSigner(newSigner);
        });

        // Load stored account data if it exists
        storage.get("account").then((account) => {
            if (account) {
                const parsedAccount = JSON.parse(account) as AccountStorage;
                // Validate required account fields
                if (
                    !parsedAccount.address ||
                    !parsedAccount.ownerGuid ||
                    !parsedAccount.expiresAt
                ) {
                    return storage.delete("account");
                }
                setAccountStorage(parsedAccount);
            }
        });
    }, [storage]);

    // Effect to handle account data from Mini App launch parameters
    useEffect(() => {
        if (!initData?.startParam) return;

        // Parse and store account data from launch parameters
        const cartridgeAccount = JSON.parse(
            atob(initData.startParam)
        ) as AccountStorage;
        storage.set("account", JSON.stringify(cartridgeAccount));
        setAccountStorage(cartridgeAccount);
    }, [initData, storage]);

    // Create CartridgeSessionAccount instance when account and signer are available
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

    // Function to open connection page for account setup
    const openConnectionPage = () => {
        // Create new signer if none exists
        if (!sessionSigner) {
            const privateKey = Dojo.signingKeyNew();
            const publicKey = Dojo.verifyingKeyNew(privateKey);

            const newSigner = { privateKey, publicKey };
            storage.set("sessionSigner", JSON.stringify(newSigner));
            setSessionSigner(newSigner);
            return;
        }

        // Open keychain URL with session parameters
        utils.openLink(
            encodeUrl(
                `${KEYCHAIN_URL}/session?public_key=${
                    sessionSigner.publicKey
                }&redirect_uri=${REDIRECT_URI}&redirect_query_name=startapp&policies=${JSON.stringify(
                    POLICIES
                )}&rpc_url=${RPC_URL}`
            )
        );
        miniApp.close();
    };

    // Function to clear current session data
    const clearSession = () => {
        storage.delete("sessionSigner");
        storage.delete("account");
        setSessionSigner(undefined);
        setAccountStorage(undefined);
    };

    // Context value containing account state and functions
    const value = {
        accountStorage,
        sessionSigner,
        account,
        openConnectionPage,
        clearSession,
        address: accountStorage?.address,
        username: accountStorage?.username,
    };

    return (
        <AccountContext.Provider value={value}>
            {children}
        </AccountContext.Provider>
    );
};

export const useAccount = () => {
    const context = useContext(AccountContext);
    if (context === undefined) {
        throw new Error("useAccount must be used within an AccountProvider");
    }
    return context;
};
```

### 2. Use the hook in your component:

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

### 3. Available properties and functions:

-   `accountStorage`: Contains user account information (username, address, ownerGuid)
-   `sessionSigner`: Contains the session's private and public keys
-   `account`: The CartridgeSessionAccount instance
-   `openConnectionPage()`: Function to open the connection page for account setup
-   `clearSession()`: Function to clear the current session
-   `address`: The user's account address
-   `username`: The user's username

### 4. Ensure your app is wrapped with the AccountProvider:

```javascript
import { AccountProvider } from "./path/to/AccountProvider";

function App() {
    return <AccountProvider>{/* Your app components */}</AccountProvider>;
}
```

### 5. Connecting to the controller

```javascript
const { openConnectionPage } = useAccount();
openConnectionPage();
```

See the full example [here](https://github.com/cartridge-gg/beast-slayers).
