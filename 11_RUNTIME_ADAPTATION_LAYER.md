# Runtime Adaptation Layer v3.1

## Purpose

The Runtime Adaptation Layer connects the vendor-neutral Harness Core to concrete coding-agent runtimes without moving governance rules into vendor-specific prompts.

## Architecture

```text
Harness Core
  |
  +-- Runtime Adapter Contract
      |
      +-- Generic Agent Adapter
      +-- Codex Adapter
      +-- Claude Code Adapter
```

## Separation rule

The core owns:
- task/state schemas
- rules
- workflows
- gates
- evidence requirements
- approval policy

Adapters own:
- how instructions are presented to a runtime
- how commands are invoked
- how files/context are exposed
- how shell/tool permissions are mapped
- how outputs are normalized back into Harness artifacts

An adapter MUST NOT weaken core policy.

## Required adapter capabilities

1. Initialize task context
2. Select workflow
3. Load scoped rules
4. Load task-specific context
5. Execute planner/worker role
6. Persist state
7. Emit normalized evidence
8. Return gate-compatible results
9. Stop on approval boundary
10. Resume from checkpoint
