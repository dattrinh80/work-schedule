# Project Profile Specification

Example:

```yaml
project:
  type: monorepo
  package_manager: pnpm

stacks:
  frontend:
    framework: nextjs
    root: apps/web
  backend:
    framework: nestjs
    root: apps/api

datastores:
  - postgres
  - redis

tooling:
  docker: true
  compose: true

commands:
  build: pnpm build
  lint: pnpm lint
  typecheck: pnpm typecheck
  test: pnpm test
```

The profile is evidence from repository inspection, not an architecture decision.
