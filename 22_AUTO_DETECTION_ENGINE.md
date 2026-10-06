# Project Auto-Detection & Bootstrap Engine - v4.0

## Purpose

Detect repository structure and technology automatically, then generate a conservative Harness project profile.

## Detects

- package manager: npm, pnpm, yarn, bun
- JavaScript/TypeScript frameworks: Next.js, NestJS, React, Vite, Express
- PHP/Laravel
- Python projects
- monorepo indicators
- Docker / Compose
- database indicators: PostgreSQL, MySQL, SQLite, Redis
- existing test/lint/build scripts
- likely frontend/backend roots

## Outputs

- `.ai/runtime/bootstrap/project-profile.yaml`
- `.ai/runtime/bootstrap/detection-report.md`
- generated `.ai/harness/project-commands.generated.yaml`
- recommended command merge for `.ai/harness/project-commands.yaml`

## Safety

Detection is read-only. Generated commands are proposals and are not executed automatically.
