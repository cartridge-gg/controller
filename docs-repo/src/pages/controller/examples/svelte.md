---
title: Controller Svelte Integration
description: Learn how to integrate the Cartridge Controller into your Svelte application, including setup, configuration, and usage examples.
---

# Svelte

## Installation

:::code-group

```bash \[npm]
npm install @cartridge/controller starknet@^7.6.2 @starknet-io/types-js@^0.8.4
```

```bash \[pnpm]
pnpm install @cartridge/controller starknet@^7.6.2 @starknet-io/types-js@^0.8.4
```

```bash \[yarn]
yarn add @cartridge/controller starknet@^7.6.2 @starknet-io/types-js@^0.8.4
```

```bash \[bun]
bun add @cartridge/controller starknet@^7.6.2 @starknet-io/types-js@^0.8.4
```

:::

> **Note**: This example requires StarkNet.js v7.6.2 or later. If you're upgrading from v6.x, see our [Migration Guide](/controller/migration-guide.md).

## Setting Up the Controller

Import the `Controller` and create an instance:

```typescript
// src/routes/+page.svelte
import { onMount } from "svelte";
import Controller from "@cartridge/controller";
import { account, username } from "../stores/account";
import { ETH_CONTRACT } from "../constants";

let controller = new Controller({
    policies: {
        contracts: {
            [ETH_CONTRACT]: {
                methods: [
                    {
                        name: "approve",
                        entrypoint: "approve",
                        description: "Approve spending of tokens",
                    },
                    {
                        name: "transfer", 
                        entrypoint: "transfer",
                        description: "Transfer tokens",
                    },
                ],
            },
        },
    },
});
```

### Connecting a Wallet

Use the `connect` method to establish a connection:

```svelte
<script lang="ts">
    async function connect() {
        try {
            const res = await controller.connect();
            if (res) {
                account.set(controller);
                username.set(await controller.username());
            }
        } catch (e) {
            console.log(e);
        }
    }

    onMount(async () => {
        if (await controller.probe()) {
            // auto connect
            await connect();
        }
        loading = false;
    });
</script>

<button on:click={connect}>Connect</button>
```

### Disconnecting a Wallet

Implement a disconnect function:

```svelte
<script lang="ts">
    function disconnect() {
        controller.disconnect();
        account.set(undefined);
        username.set(undefined);
    }
</script>

<button on:click={disconnect}>Disconnect</button>
```

### Displaying User Information

Create a `UserInfo` component to show account details:

```svelte
<!-- src/components/UserInfo.svelte -->
<script lang="ts">
    export let accountAddress: string | undefined;
    export let username: string | undefined;
</script>

<h2>User Information</h2>
<div>
    {#if accountAddress}
        <p>Account Address: {accountAddress}</p>
    {:else}
        <p>No account connected</p>
    {/if}

    {#if username}
        <p>Username: {username}</p>
    {/if}
</div>
```

### Performing Transactions

Create a `TransferEth` component for executing transactions:

```svelte
<!-- src/components/TransferEth.svelte -->
<script lang="ts">
    import { AccountInterface } from 'starknet';
    import { ETH_CONTRACT } from '../constants';
    export let account: AccountInterface | undefined;

    async function execute(amount: string, manual: boolean) {
        if (!account) return;

        try {
            const result = await account.execute([
                {
                    contractAddress: ETH_CONTRACT,
                    entrypoint: manual ? 'increaseAllowance' : 'approve',
                    calldata: [account.address, amount, '0x0']
                },
                {
                    contractAddress: ETH_CONTRACT,
                    entrypoint: 'transfer',
                    calldata: [account.address, amount, '0x0']
                }
            ]);
            console.log('Transaction hash:', result.transaction_hash);
        } catch (e) {
            console.error(e);
        }
    }
</script>

<h2>Transfer Eth</h2>
<button on:click={() => execute('0x0', false)}>Transfer 0 ETH to self</button>
<button on:click={() => execute('0x1C6BF52634000', false)}>Transfer 0.005 ETH to self</button>
<button on:click={() => execute('0x0', true)}>Manual: Transfer 0 ETH to self</button>
```

### Full Example

Here's how your main `+page.svelte` might look:

```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import Controller from '@cartridge/controller';
    import { account, username } from '../stores/account';
    import UserInfo from '../components/UserInfo.svelte';
    import TransferEth from '../components/TransferEth.svelte';
    import { ETH_CONTRACT } from '../constants';

    let controller = new Controller({
        policies: [
            // ... your policies here
        ]
    });

    let loading: boolean = true;

    async function connect() {
        // ... connection logic
    }

    function disconnect() {
        // ... disconnection logic
    }

    onMount(async () => {
        // ... auto-connect logic
    });
</script>

<h1>SvelteKit + Controller Example</h1>

<div>
    {#if loading}
        <p>Loading</p>
    {:else if $account}
        <button on:click={disconnect}>Disconnect</button>
    {:else}
        <button on:click={connect}>Connect</button>
    {/if}
</div>

{#if $account && !loading}
    <UserInfo accountAddress={$account?.address} username={$username} />
    <TransferEth account={$account} />
{/if}
```

This example demonstrates how to set up the Controller, connect/disconnect a wallet, display user information, and perform transactions in a Svelte application using the Cartridge Controller.
