# Configuration

Controller provides several configuration options related to chains, sessions, and theming.

## ControllerOptions

```typescript
export type ControllerOptions = {
    policies?: Policy[];
    rpc?: string;
    propagateSessionErrors?: boolean;
    theme?: string;
    colorMode?: ColorMode;
};
```

-   **policies** (`Policy[]`): An array of policies defining permissions for session keys.
-   **rpc** (`string`): The URL of the RPC for Slot deployments.
-   **theme** (`string`): The theme name for the wallet interface. See the [Theming](./theming.md) section for details on how to add and configure custom themes.
-   **propagateSessionErrors** (`boolean`): Whether to propagate transaction errors back to the caller.
-   **colorMode** (`"light"` \| `"dark"`): The color mode of the interface.
