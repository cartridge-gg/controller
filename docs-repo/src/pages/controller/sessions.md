---
title: Sessions and Policies
description: Learn about Cartridge Controller's session-based authentication and policy-based transaction approvals system.
---

# Sessions and Policies

Cartridge Controller supports session-based authorization and policy-based transaction approvals. When a policy is preapproved, games can perform interactions seamlessly without requesting approval from the player each time.

## Managing Your Sessions

### Viewing Active Sessions

You can view and manage your active game sessions through the Controller settings:

1. Open your Controller wallet
2. Navigate to Settings (gear icon)
3. Find the "Session Key(s)" section

Each session card displays:
- **Game/App Name**: The application that created the session
- **Device Type**: Shows whether the session was created on desktop or mobile
- **Expiration Time**: How long until the session expires (shown as "1d", "5h", "30m", etc.)

### Revoking Individual Sessions

To revoke a specific session:

1. In the Sessions section, find the session you want to remove
2. Tap the trash icon next to the session card
3. Review the session details in the confirmation dialog
4. Tap "DELETE" to confirm, or "Cancel" to keep the session

### Revoking All Sessions

To revoke all active sessions at once:

1. In the Sessions section, look for "Revoke All" in the top-right
2. Tap "Revoke All" 
3. Confirm the action

:::warning
Revoking sessions will require you to reconnect and re-authorize games the next time you play them.
:::

### Understanding Signers

The "Signer(s)" section shows the authentication methods you've set up:
- **WebAuthn/Touch ID**: Biometric authentication
- **Discord**: Social login through Discord
- **External Wallets**: Connected wallets like MetaMask, Phantom, etc.

## Developer Integration

For developers looking to integrate session policies into their games:

## Session Options

```typescript
export type SessionOptions = {
  rpc: string;                // RPC endpoint URL
  chainId: string;            // Chain ID for the session
  policies: SessionPolicies;  // Approved transaction policies
  redirectUrl: string;        // URL to redirect after registration
};
```

## Defining Policies

Policies allow your application to define permissions that can be pre-approved by the user:

```typescript
type SessionPolicies = {
  contracts: {
    [address: string]: ContractPolicy;  // Contract interaction policies
  };
  messages?: TypedDataMessage[];        // Optional signed message policies
};

type ContractPolicy = {
  name?: string;                        // Human-readable name of the contract
  description?: string;                 // Description of the contract
  methods: Method[];                    // Allowed contract methods
};

type ContractMethod = {
  name: string;                         // Method name
  entrypoint: string;                   // Contract method entrypoint
  description?: string;                 // Optional method description
};

type SignMessagePolicy = TypedDataPolicy & {
  name?: string;                        // Human-readable name of the policy
  description?: string;                 // Description of the policy
};

type TypedDataPolicy = {
  types: Record<string, StarknetType[]>;
  primaryType: string;
  domain: StarknetDomain;
};
```

## Usage Examples

### Contract Interaction Policies Example

```typescript
const policies: SessionPolicies = {
  contracts: {
    "0x4ed3a7c5f53c6e96186eaf1b670bd2e2a3699c08e070aedf4e5fc6ac246ddc1": {
      name: "Pillage",
      description: "Allows you to raid a structure and pillage resources",
      methods: [
        {
          name: "Battle Pillage",
          description: "Pillage a structure",
          entrypoint: "battle_pillage"
        }
      ]
    },
    "0x2620f65aa2fd72d705306ada1ee7410023a3df03da9291f1ccb744fabfebc0": {
      name: "Battle contract",
      description: "Required to engage in battles",
      methods: [
        {
          name: "Battle Start",
          description: "Start a battle",
          entrypoint: "battle_start"
        },
        {
          name: "Battle Join",
          description: "Join a battle",
          entrypoint: "battle_join"
        },
        {
          name: "Battle Leave",
          description: "Leave a battle",
          entrypoint: "battle_leave"
        },
      ]
    },
    // Include other contracts as needed
  }
};

// Using the controller directly
const controller = new Controller({
  policies,
  // other options
});

// Using starknet-react connector
const connector = new CartridgeConnector({
  policies,
  // other options
});
```

### Signed Message Policy Example

Signed Message policies allow the application to sign a typed message without manual approval from the user.

```typescript
const policies: SessionPolicies = {
  messages: [
    {
      name: "Eternum Message Signing",
      description: "Allows signing messages for Eternum",
      types: {
        StarknetDomain: [
          { name: "name", type: "shortstring" },
          { name: "version", type: "shortstring" },
          { name: "chainId", type: "shortstring" },
          { name: "revision", type: "shortstring" }
        ],
        "s0_eternum-Message": [
          { name: "identity", type: "ContractAddress" },
          { name: "channel", type: "shortstring" },
          { name: "content", type: "string" },
          { name: "timestamp", type: "felt" },
          { name: "salt", type: "felt" }
        ]
      },
      primaryType: "s0_eternum-Message",
      domain: {
        name: "Eternum",
        version: "1",
        chainId: "SN_MAIN",
        revision: "1"
      }
    }
  ]
};
```

### Verified Sessions


Verified session policies provide a better user experience by attesting to the validity of a games session policy configuration, providing confidence to it's players.

![Verified Session](/verified-session.svg)

Verified configs can be committed to the `configs` folder in [`@cartridge/presets`](https://github.com/cartridge-gg/presets/tree/main/configs).

Before they are merged, the team will need to collaborate with Cartridge to verify the policies.
