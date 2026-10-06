# Claude Code Adapter Runbook

## Initialize

Run Claude Code from the repository root so project `CLAUDE.md` is loaded.

## Planning

Use plan mode where appropriate:

`claude --permission-mode plan`

Then ask:

`Prepare the Harness implementation plan for task <TASK_ID>. Do not modify product source.`

## Feature implementation

Use normal/default permission mode with project settings and explicit approvals:

`Execute FEATURE task <TASK_ID> using .ai/workflows/feature.yaml. Follow CLAUDE.md and .ai governance. Stop for contract or human-approval boundaries.`

## Programmatic verification

A wrapper may use bounded structured execution:

`claude -p --output-format json --max-turns <N> "<verification task>"`

Do not rely on model output alone. Inspect actual command/test artifacts.

## Resume

Native session continuation:
- `claude --continue`
- `claude --resume <session-id>`

Harness recovery still validates `.ai/runtime` checkpoint state against the current repository.

## Safety

Do not make `--dangerously-skip-permissions` the project default. For unattended automation, use an independently controlled sandbox and external limits.
