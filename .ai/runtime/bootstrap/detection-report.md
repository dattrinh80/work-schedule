# Project Detection Report

- Project type: `monorepo`
- Package manager: `pnpm`

## Stacks
- frontend: `{'framework': 'react', 'root': 'apps/web'}`
- backend: `{'framework': 'nestjs', 'root': 'apps/api'}`
- other: `[{'framework': 'node', 'root': 'packages/shared'}, {'framework': 'node', 'root': '.'}]`

## Datastores
- postgres

## Proposed commands
- install: `pnpm install --frozen-lockfile`
- build: `pnpm build`
- lint: `pnpm lint`
- typecheck: `pnpm typecheck`
- test: `pnpm test`
- contract_test: `pnpm test:contract`
- architecture_test: `pnpm test:architecture`
- ui_test: `pnpm test:ui`

## Important
Generated commands are proposals. Review before merging into `.ai/harness/project-commands.yaml`.
