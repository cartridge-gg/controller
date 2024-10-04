# Sessions and Policies

Catridge Controller supports requesting preapproval for a set of `policies`. When a policy is preapproved, games can perform the interaction seamlessly without requesting approval from the player each time. Policys are requested during connection. Executing transactions follows the same pattern and controller will take care of requesting player approval only when necessary.

#### Defining Policies

Policies allow your application to define permissions that can be pre-approved by the user. This enables seamless interaction without requiring user approval for each transaction that matches a policy.

```typescript
const policies: Policy[] = [
  {
    target: "0xYourContractAddress",
    method: "incrementCounter",
    description: "Allows incrementing the counter",
  },
  {
    target: "0xAnotherContractAddress",
    method: "transferTokens",
    description: "Allows transferring tokens",
  },
];
```

```ts
// Using the controller directly.
const controller = new Controller(policies);

// Using starknet-react connector
const connector = new CartridgeConnector(policies)
```
