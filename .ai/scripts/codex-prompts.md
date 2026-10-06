# Codex Task Prompts

## Bootstrap
Execute `.ai/workflows/bootstrap.yaml` under `AGENTS.md`. Persist state and evidence. Do not begin broad feature work until foundation and thin-slice verification pass.

## Feature
Execute FEATURE task `<TASK_ID>` using `.ai/workflows/feature.yaml`. Plan before editing source, honor contracts, use bounded repair, and stop for approval boundaries.

## Verify
Verify `<TASK_ID>` using deterministic checks and store evidence under `.ai/runtime/tasks/<TASK_ID>/evidence/`.

## Resume
Resume `<TASK_ID>` from the latest valid checkpoint after checking workspace drift.
