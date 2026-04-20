# PostHog Dashboard Configuration Guide

This document describes the dashboards and insights to configure in PostHog for monitoring keychain performance across games.

---

## Dashboard 1: Onboarding Funnel

**Purpose**: Track how players move from first load to first game interaction. This is the most important dashboard — it shows where players drop off before ever playing.

### Funnel: Signup Conversion
**Type**: Funnel insight

Steps:
1. `signup_started`
2. `signup_method_selected`
3. `signup_username_validated` (where `username_available = true`)
4. `signup_completed`

**Breakdown by**: `method` (webauthn, password, social, external_wallet, wallet_connect)

**What to watch**:
- Overall conversion rate from started → completed
- Drop-off between method selection and completion (indicates auth friction)
- Which auth methods have the highest completion rate
- Filter by `origin` (company group) to see per-game onboarding health

### Funnel: Signup → First Session → First Transaction
**Type**: Funnel insight

Steps:
1. `signup_completed`
2. `session_approved`
3. `tx_confirmed`

**Conversion window**: 24 hours

**What to watch**:
- What percentage of signups actually transact within 24h
- Per-game conversion differences (some games may have better onboarding)

### Trend: Signups Over Time
**Type**: Trends insight

- `signup_completed` — total count, daily
- Breakdown by `origin` (company group)
- Compare to `signup_started` to see conversion trend

### Trend: Auth Method Distribution
**Type**: Trends insight

- `signup_completed` — total count, daily
- Breakdown by `method`

**What to watch**: Shift in auth method preference over time (e.g., passkey adoption)

### Metric: Signup Duration (P50/P95)
**Type**: Trends insight with aggregation

- `signup_completed` → aggregate by `duration_ms` (median, p95)
- Breakdown by `method`

---

## Dashboard 2: Session Management

**Purpose**: Sessions are the gateway to gameplay. Track how smoothly games get session approval from players.

### Funnel: Session Approval
**Type**: Funnel insight

Steps:
1. `session_requested`
2. `session_approved`
3. `session_registered`

**Breakdown by**: `origin`, `verified` (verified vs unverified sessions)

**What to watch**:
- Approval rate: what % of session requests get approved
- Registration failure rate: approved but failed to register on-chain
- Verified vs unverified session approval rates (verified should be higher)

### Trend: Session Rejections
**Type**: Trends insight

- `session_rejected` — count, daily
- Breakdown by `origin`

**What to watch**: Spikes indicate a game is requesting suspicious policies, or UX confusion

### Metric: Session Registration Time
**Type**: Trends insight with aggregation

- `session_registered` → aggregate by `duration_ms` (median, p95)

**What to watch**: On-chain registration latency — affected by network congestion

### Trend: Session Updates (Expired Refreshes)
**Type**: Trends insight

- `session_updated` — count, daily
- Breakdown by `origin`

**What to watch**: High refresh rates may indicate sessions are expiring too quickly for a game's play session length

---

## Dashboard 3: Transaction Performance

**Purpose**: Core wallet operation — measure speed, success rate, and failure modes.

### Funnel: Transaction Flow
**Type**: Funnel insight

Steps:
1. `tx_requested`
2. `tx_fee_estimated`
3. `tx_approved`
4. `tx_submitted`
5. `tx_confirmed`

**Breakdown by**: `origin`

**What to watch**:
- Drop-off at fee estimation (may indicate RPC issues or contract errors)
- Drop-off at approval (user chose not to confirm)
- Drop-off between submitted and confirmed (network failures)

### Metric: Transaction Latency Breakdown
**Type**: Trends insight with aggregation — create one for each segment:

| Insight | Event | Metric |
|---|---|---|
| Fee Estimation Time | `tx_fee_estimated` → `duration_ms` | P50, P95 |
| User Decision Time | `tx_approved` → `duration_ms` | P50, P95 |
| Signing + Submission Time | `tx_submitted` → `duration_ms` | P50, P95 |
| On-chain Confirmation Time | `tx_confirmed` → `duration_ms` | P50, P95 |

**What to watch**:
- Fee estimation > 3s → RPC performance issue
- Confirmation > 30s → network congestion
- Signing time spikes → WebAuthn issues on specific devices

### Trend: Transaction Failures by Stage
**Type**: Trends insight

- `tx_failed` — count, daily
- Breakdown by `stage` (estimation, signing, submission, confirmation)

**What to watch**: Clustering of failures at a specific stage indicates a systemic issue

### Trend: Transaction Volume
**Type**: Trends insight

- `tx_confirmed` — count, daily/hourly
- Breakdown by `origin`

**What to watch**: Overall platform usage growth, per-game activity

---

## Dashboard 4: Purchase & Revenue

**Purpose**: Track purchase funnel and revenue flow.

### Funnel: Purchase Conversion
**Type**: Funnel insight

Steps:
1. `purchase_started`
2. `purchase_method_selected`
3. `purchase_checkout_started`
4. `purchase_completed`

**Breakdown by**: `method` (stripe, onchain, coinbase), `type` (starterpack, credits)

### Trend: Revenue by Method
**Type**: Trends insight

- `purchase_completed` → sum of `amount_usd`
- Breakdown by `method`

### Trend: Purchase Failures
**Type**: Trends insight

- `purchase_failed` — count, daily
- Breakdown by `method`, `stage`

**What to watch**: Stripe failures vs on-chain failures — different root causes

### Metric: Purchase Duration
**Type**: Trends insight with aggregation

- `purchase_completed` → `duration_ms` (median, p95)
- Breakdown by `method`

**What to watch**: On-chain purchases are inherently slower; Stripe should be fast

---

## Dashboard 5: Platform Performance

**Purpose**: Technical health metrics for the wallet infrastructure.

### Metric: WebAuthn Latency
**Type**: Trends insight with aggregation

- `webauthn_latency` → `duration_ms` (P50, P95, P99)
- Breakdown by `operation` (create, get)
- Breakdown by `$browser` (PostHog auto-property)

**What to watch**:
- Cross-browser differences (Safari WebAuthn is notably different from Chrome)
- Degradation over time

### Metric: RPC Latency
**Type**: Trends insight with aggregation

- `rpc_latency` → `duration_ms` (P50, P95)
- Breakdown by `method`, `chain_id`

**What to watch**: RPC provider health, per-chain differences

### Metric: Iframe Load Time
**Type**: Trends insight with aggregation

- `iframe_ready` → `duration_ms` (P50, P95)

**What to watch**: Keychain bundle size regressions, CDN issues

### Trend: Error Rate
**Type**: Trends insight

- `error_boundary_hit` — count, daily
- Breakdown by `route`

**What to watch**: Spikes correlating with deploys

### Trend: Fee Estimation Failures
**Type**: Trends insight

- `tx_fee_estimation_failed` — count, daily

**What to watch**: RPC availability issues, contract compatibility problems

---

## Dashboard 6: Per-Game Overview

**Purpose**: Give each game studio a view of their players' wallet experience. Use PostHog's group analytics filtering by `company` (origin).

### Key Metrics (filtered by company group):

| Metric | Insight Type | Description |
|---|---|---|
| Daily Active Wallets | Trends: unique users with any event | How many unique players use the wallet |
| Signup Conversion | Funnel: started → completed | % of new players who complete signup |
| Session Approval Rate | Funnel: requested → approved | % of session requests approved |
| Tx Success Rate | Formula: confirmed / requested | % of transactions that succeed end-to-end |
| Avg Tx Latency | Trends: tx_confirmed duration_ms P50 | How fast transactions complete |
| Purchase Revenue | Trends: purchase_completed sum amount_usd | Revenue through wallet |
| Error Rate | Trends: tx_failed + error_boundary_hit | Issues affecting players |

### How to set up:
1. Create a dashboard template with the above insights
2. Add a global filter: `Company = {origin}`
3. Save as a template — duplicate per game or use PostHog's dashboard filters

---

## Dashboard 7: Login Health

**Purpose**: Track returning player experience separately from new signups.

### Funnel: Login Flow
**Type**: Funnel insight

Steps:
1. `login_started`
2. `login_completed`

**Breakdown by**: `method`, `origin`

### Trend: Login Failures
**Type**: Trends insight

- `login_failed` — count, daily
- Breakdown by `method`, `error_message`

**What to watch**: Passkey failures on specific platforms, password reset needs

### Metric: Login Duration
**Type**: Trends insight with aggregation

- `login_completed` → `duration_ms` (P50, P95)
- Breakdown by `method`

---

## Alerts to Configure

PostHog supports alerts on insights. Set up these critical alerts:

| Alert | Condition | Threshold | Channel |
|---|---|---|---|
| Signup conversion drop | Funnel conversion rate | < 50% over 24h rolling | Slack #alerts |
| Transaction failure spike | `tx_failed` count | > 2x 7-day average | Slack #alerts |
| Error boundary spike | `error_boundary_hit` count | > 10 in 1 hour | Slack #alerts |
| Purchase failure spike | `purchase_failed` count | > 5 in 1 hour | Slack #alerts |
| WebAuthn latency degradation | `webauthn_latency` P95 | > 5000ms | Slack #eng |
| RPC latency degradation | `rpc_latency` P95 | > 10000ms | Slack #eng |
| Session rejection spike | `session_rejected` count | > 3x 7-day average | Slack #eng |

---

## Session Recordings

Enable PostHog session recordings for these flows (use feature flags to control sampling):

- **Signup flow**: Record 100% — critical for understanding drop-off
- **Session approval**: Record 10% — understand rejection reasons
- **Transaction confirmation**: Record 5% — debug confused users
- **Purchase flow**: Record 100% — revenue-critical, debug payment issues

**Recording filters**: Only record sessions that include at least one custom event (skip idle/bounce sessions).

---

## Implementation Priority

**Phase 1 (ship with instrumentation code):**
1. Dashboard 1: Onboarding Funnel — the most critical, shows where new players drop off
2. Dashboard 3: Transaction Performance — core wallet operation health
3. Dashboard 2: Session Management — gateway to gameplay
4. Alerts for the above 3 dashboards

**Phase 2 (after core dashboards prove valuable):**
5. Dashboard 4: Purchase & Revenue
6. Dashboard 6: Per-Game Overview (template)
7. Dashboard 7: Login Health

**Phase 3 (after secondary flow instrumentation):**
8. Dashboard 5: Platform Performance (requires WebAuthn/RPC instrumentation)

**Note:** Dashboards 5-7 depend on events not yet instrumented under Approach B.
Only build them after the core 4 funnels are instrumented and producing insights.
