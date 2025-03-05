# Development Guide for Claude

## Build/Test/Lint Commands
- Build all packages: `pnpm build`
- Build dependencies: `pnpm build:deps`
- Generate contract artifacts: `make generate_artifacts`
- Run linting: `pnpm lint`
- Format code: `pnpm format`
- Run tests: `pnpm test`
- Run storybook tests: `pnpm test:storybook`
- Update test snapshots: `pnpm test:storybook:update`
- Test session functionality: `make test-session`
- Start dev environment: `pnpm dev`
- Run storybook: `pnpm storybook`

## Code Style Guidelines
- **Imports**: External dependencies first, then internal modules
- **Formatting**: 2-space indentation, double quotes, 80-char line limit
- **Types**: Export interfaces/types separately, use descriptive names
- **Naming**: PascalCase (Components/Classes/Types), camelCase (variables/functions), 
  ALL_CAPS (constants), prefix hooks with "use"
- **Error Handling**: Custom error classes with codes, try/catch with proper propagation
- **Documentation**: Document complex functions and public interfaces
- **Testing**: Write unit tests for new functionality

Use these guidelines to maintain consistency across the codebase.