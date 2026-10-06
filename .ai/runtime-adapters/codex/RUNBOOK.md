# Codex Adapter Runbook

## Initialize

Run Codex from the repository root. Codex can use `AGENTS.md` instructions and project `.codex/config.toml` when the project is trusted.

## Bootstrap

Prompt:

`Execute the Harness bootstrap workflow in .ai/workflows/bootstrap.yaml. Use BOOTSTRAP_PROMPT.md as the task contract preamble. Do not begin broad implementation before foundation gates pass.`

## Feature

Prompt:

`Execute FEATURE task <TASK_ID> under .ai/workflows/feature.yaml. Load task state, compile minimal context, plan first, run architecture/contract gates, then implement within approved scope.`

## Verify

Prompt:

`Run applicable deterministic verification for <TASK_ID>, collect evidence under .ai/runtime/tasks/<TASK_ID>/evidence, and return normalized gate results.`

## Review

Prompt:

`Review the actual diff for <TASK_ID> against the approved plan, rules, contracts and evidence. Do not modify source unless explicitly routed to repair.`

## Safety baseline

Use `workspace-write` for ordinary implementation and `on-request` approval for interactive use. Do not use unrestricted/full-access modes as the project default.
