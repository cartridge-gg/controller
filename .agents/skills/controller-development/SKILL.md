---
name: controller-development
description: Contributor workflow for cartridge-gg/controller. Use when implementing or reviewing changes across this pnpm/turbo monorepo, including SDK, keychain UI, examples, storybook snapshots, and test/lint pipelines.
---

# Controller Development

Use this skill to implement changes in `cartridge-gg/controller` with monorepo-aware validation.

## Core Workflow

1. Install and bootstrap:
   - `corepack enable pnpm`
   - `pnpm i`
2. Pick scope using package filters when possible:
   - `pnpm --filter @cartridge/controller <command>`
   - `pnpm --filter @cartridge/keychain <command>`
   - `pnpm --filter @cartridge/connector <command>`
3. Run targeted validation:
   - `pnpm test`
   - `pnpm test:ci` when changes cross packages
   - `pnpm test:storybook` for component/UI changes
4. Run quality checks:
   - `pnpm lint`
   - `pnpm format`
5. Run full build before PR when changes affect published packages:
   - `pnpm build`

## UI And Snapshot Guidance

- Run `pnpm storybook` when changing keychain UI components.
- Update snapshots with `pnpm test:storybook:update` only when intentional visual diffs are confirmed.

## PR Checklist

- Keep workspace changes scoped and avoid unrelated package churn.
- Report exact commands run and package filters used.
- Mention snapshot updates explicitly when present.
