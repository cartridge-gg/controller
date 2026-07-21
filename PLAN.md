# Credit Card Credits Flow Implementation Plan

## Overview

Route starter-pack credit-card purchases through the existing USD credits
deposit flow instead of creating a direct Coinflow starter-pack checkout. After
credits settle, resume the original bundle purchase automatically.

## Goals

- Always open the credits deposit flow when "Credit Card" is selected.
- Default to the Credits rail whenever the existing balance covers the purchase.
- Display the card-backed purchase amount in USD, not USDC.
- Preserve automatic purchase completion after the deposited credits become
  available.

## Non-Goals

- Change Apple Pay, wallet, or direct credits behavior.
- Remove Coinflow support from the standalone credits deposit flow.

## Assumptions and Constraints

- The existing credits quote remains the authoritative bundle price.
- Existing minimum and maximum credits purchase limits remain unchanged.
- Coinflow sandbox deposits do not produce spendable credits and retain the
  current warning/error behavior.

## Requirements

### Functional

- Credit-card checkout starts a Coinflow-backed credits deposit.
- The deposit amount covers the credits shortfall and respects the minimum
  deposit.
- Successful settlement purchases the requested bundle with credits.
- The review total uses the USD pseudo-token and credits quote.

### Non-Functional

- Keep analytics method attribution as `coinflow` for card selection.
- Reuse the existing stale-purchase and duplicate-completion guards.

## Technical Design

### Data Model

No schema changes.

### API Design

No API changes. Reuse bundle credits quote, credits deposit, balance refresh,
and credits purchase operations.

### Architecture

`Credit Card selection -> credits deposit drawer -> credits settlement -> bundle credits purchase -> success`

### UX Flow

The review screen shows USD. Continue opens the credits amount/deposit flow with
Coinflow preferred; completion resumes the original purchase.

---

## Implementation Plan

### Serial Dependencies (Must Complete First)

#### Phase 0: Shared Calculation

**Prerequisite for:** Checkout routing

| Task | Description                                                  | Output                       |
| ---- | ------------------------------------------------------------ | ---------------------------- |
| 0.1  | Centralize shortfall-to-USD rounding and minimum enforcement | Tested credits top-up helper |

---

### Parallel Workstreams

#### Workstream A: Checkout Routing

**Dependencies:** Phase 0 **Can parallelize with:** Workstream B

| Task | Description                                                   | Output                   |
| ---- | ------------------------------------------------------------- | ------------------------ |
| A.1  | Route card purchases into credits deposit and resume purchase | Updated checkout handler |

#### Workstream B: USD Presentation

**Dependencies:** Phase 0 **Can parallelize with:** Workstream A

| Task | Description                                                 | Output                 |
| ---- | ----------------------------------------------------------- | ---------------------- |
| B.1  | Render card-backed review pricing with the USD pseudo-token | Updated cost breakdown |

---

### Merge Phase

#### Phase 2: Integration

**Dependencies:** Workstreams A, B

| Task | Description                                                                            | Output               |
| ---- | -------------------------------------------------------------------------------------- | -------------------- |
| 2.1  | Remove direct starter-pack Coinflow drawer restrictions and validate the combined flow | Focused, linted diff |

---

## Testing and Validation

- Unit-test top-up rounding, existing-balance subtraction, and minimum
  enforcement.
- Run keychain unit tests, lint/format checks, and TypeScript build.

## Rollout and Migration

No migration. Ship with the next controller/keychain release; rollback is a
normal code revert.

## Risks and Mitigations

- Credits settlement delay: retain polling and stale-purchase guards.
- Sandbox cannot mint spendable credits: retain the explicit sandbox failure
  message.

## Open Questions

None; the Slack thread defines the required routing and currency behavior.
