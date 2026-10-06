# AI Software Development Harness v4.0

This project uses `.ai/` as the software-development control plane.

@.ai/agents/orchestrator.md
@.ai/harness/harness.yaml

## Mandatory rules

- Load or create a Task Contract before product-code edits.
- Plan and analyze impact before implementation.
- Use approved architecture/data/API/UX contracts.
- Never silently alter an approved contract.
- Do not perform unrelated refactors.
- Prefer deterministic verification over self-assessment.
- Do not mark a task DONE unless all applicable blocking gates pass and evidence is complete.
- Persist important decisions in repository artifacts, not only conversation memory.
- Stop for high-risk approval boundaries.
- Do not use bypass-permissions mode as the normal project workflow.
- Keep repairs bounded and stop after repeated no-progress.
- Do not expose or commit secrets.
- Normal coding work has no production access.

## Sources of truth

- `docs/product/`
- `docs/architecture/`
- `docs/database/`
- `docs/ux/`
- `docs/api/`
- `docs/adr/`
- `docs/decisions/`

## Workflows

- Bootstrap: `.ai/workflows/bootstrap.yaml`
- Feature: `.ai/workflows/feature.yaml`
- Bugfix: `.ai/workflows/bugfix.yaml`
- Migration: `.ai/workflows/migration.yaml`
- UI refinement: `.ai/workflows/ui-refinement.yaml`
