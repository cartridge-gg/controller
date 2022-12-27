---
title: Sessions
sidebar_position: 1
slug: /controller/sessions
---

Catridge Controller supports creating sessions, granting an application preapproval for a set of `policies`. When a policy is preapproved, games can perform the interaction seamlessly without requesting approval from the player each time. Policys are requested during connection. Executing transactions follows the same pattern and controller will take care of requesting player approval only when necessary.

```ts
// Using the controller directly.
const controller = new Controller([{
    target: "0xdead",
    method: "have_turn",
}]);

// Using starknet-react connector
const connector = new CartridgeConnector([{
    target: "0xdead",
    method: "have_turn",
}])
```
