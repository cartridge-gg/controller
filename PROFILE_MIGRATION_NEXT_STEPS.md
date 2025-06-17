# Profile to Keychain Migration - Next Steps

## Overview

This document outlines the remaining steps to complete the migration of the Profile package into the Keychain package. The initial step has been completed to establish the foundation for the migration.

## Initial Step Completed ✅

**Phase 1: Route Structure and Dependencies**
- ✅ Added profile-specific dependencies to keychain package.json:
  - `@cartridge/arcade`, `compare-versions`, `starknet`, `viem`
- ✅ Set up import path mappings for profile components (`#profile/*`)
- ✅ Created profile route structure in keychain (`/profile/*` routes)
- ✅ Created placeholder components for all profile functionality
- ✅ Integrated profile routes into keychain app with `/profile` prefix

## Remaining Migration Steps

### Phase 2: Component Migration (HIGH PRIORITY)

**2.1 Move Core Profile Components**
- [ ] Copy `packages/profile/src/components/account.tsx` → `packages/keychain/src/components/profile/account.tsx`
- [ ] Copy entire `packages/profile/src/components/inventory/` directory
- [ ] Copy `packages/profile/src/components/achievements/` directory
- [ ] Copy `packages/profile/src/components/activity.tsx`
- [ ] Copy `packages/profile/src/components/slot.tsx`
- [ ] Copy `packages/profile/src/components/socials/` directory  
- [ ] Copy `packages/profile/src/components/leaderboard/` directory

**2.2 Update Import Paths**
- [ ] Replace all `#components/*` imports with relative paths or `@/components/profile/*`
- [ ] Update all `#hooks/*` imports to use new `#profile/*` mappings
- [ ] Update any absolute imports to work within keychain structure

**2.3 Move Profile-Specific Infrastructure**
- [ ] Copy `packages/profile/src/hooks/` → `packages/keychain/src/profile/hooks/`
- [ ] Copy `packages/profile/src/context/` → `packages/keychain/src/profile/context/`
- [ ] Copy `packages/profile/src/models/` → `packages/keychain/src/profile/models/`
- [ ] Copy `packages/profile/src/constants.ts` → `packages/keychain/src/profile/constants.ts`

### Phase 3: Provider Integration (MEDIUM PRIORITY)

**3.1 Merge Provider Systems**
- [ ] Integrate profile providers into keychain's provider system
- [ ] Merge connection providers (both use penpal for iframe communication)
- [ ] Consolidate theme providers (both have similar colorScheme handling)
- [ ] Merge data providers (GraphQL, React Query setup)

**3.2 Context Consolidation**
- [ ] Merge arcade context with keychain contexts
- [ ] Consolidate data context patterns
- [ ] Integrate theme context (both packages have similar theme handling)

### Phase 4: Build System Updates (MEDIUM PRIORITY)

**4.1 Update Keychain Configuration**
- [ ] Update Vite config to handle profile-specific assets
- [ ] Merge Storybook configurations for profile components
- [ ] Update TypeScript paths for profile components
- [ ] Consolidate Tailwind configurations (already very similar)

**4.2 Testing Integration**
- [ ] Move profile Storybook stories to keychain
- [ ] Update image snapshots for profile components in keychain context
- [ ] Ensure profile tests work within keychain test environment

### Phase 5: Controller Package Updates (HIGH PRIORITY)

**5.1 Update iframe Integration**
- [ ] Modify `packages/controller/src/iframe/profile.ts` to point to keychain URLs
- [ ] Update ProfileIFrame class to handle `/profile` routes in keychain
- [ ] Remove separate profile iframe handling (consolidate with keychain iframe)

**5.2 Update URL Handling**
- [ ] Change profile URLs from `profile.cartridge.gg` to `x.cartridge.gg/profile`
- [ ] Update any hardcoded profile URLs in controller package
- [ ] Update examples that reference profile URLs

### Phase 6: Infrastructure Cleanup (LOW PRIORITY)

**6.1 Remove Profile Package**
- [ ] Delete `packages/profile/` directory
- [ ] Remove profile from `pnpm-workspace.yaml`  
- [ ] Remove profile from `turbo.json` build configuration
- [ ] Update package references in examples and docs

**6.2 Update Development Workflow**
- [ ] Update `pnpm dev` to only start keychain (remove profile server)
- [ ] Update CLAUDE.md to reflect new structure
- [ ] Update README files to reflect merged structure

### Phase 7: Deployment and Production Updates (CRITICAL)

**7.1 Deployment Configuration**
- [ ] Update deployment scripts to handle unified keychain package
- [ ] Configure reverse proxy/routing for `profile.cartridge.gg` → `x.cartridge.gg/profile`
- [ ] Update CDN and caching configurations
- [ ] Update monitoring and analytics for merged application

**7.2 Gradual Migration Strategy**
- [ ] Implement feature flag to toggle between old and new profile routes
- [ ] Set up A/B testing for profile migration
- [ ] Plan gradual rollout to avoid user disruption

## Risk Mitigation

### High-Risk Areas
1. **URL Changes**: Profile URLs changing from separate domain to keychain subdirectory
2. **State Management**: Ensuring profile state doesn't interfere with keychain state
3. **Bundle Size**: Combined package may increase keychain bundle size significantly
4. **Security Boundaries**: Profile and keychain have different security requirements

### Recommended Precautions
1. **Feature Flags**: Implement feature flags for easy rollback
2. **Thorough Testing**: Extensive testing of all profile functionality in keychain context
3. **Performance Monitoring**: Monitor bundle size and performance impact
4. **Gradual Rollout**: Deploy to staging/beta users first

## Success Criteria

- [ ] All profile functionality works seamlessly within keychain
- [ ] No increase in keychain bundle size beyond acceptable limits
- [ ] No regressions in existing keychain functionality
- [ ] All existing profile URLs redirect properly to new keychain routes
- [ ] Development workflow simplified (single dev server instead of two)
- [ ] Storybook integration works for both keychain and profile components
- [ ] All tests pass for both keychain and migrated profile functionality

## Timeline Estimate

- **Phase 2**: 2-3 days (component migration)
- **Phase 3**: 1-2 days (provider integration)  
- **Phase 4**: 1 day (build system)
- **Phase 5**: 1 day (controller updates)
- **Phase 6**: 0.5 day (cleanup)
- **Phase 7**: 2-3 days (deployment planning and execution)

**Total Estimated Time**: 7-10 days for complete migration

## Notes

- The current architecture intentionally separated keychain and profile for good reasons (security, scaling, deployment)
- Consider if the benefits of merging outweigh the complexity added
- Maintain clear separation between wallet operations and profile display even within the merged package
- Profile components should remain isolated and not tightly coupled with keychain components