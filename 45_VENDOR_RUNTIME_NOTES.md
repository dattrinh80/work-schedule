# Vendor Runtime Notes

## Codex

The Harness uses non-interactive `codex exec` in the worker worktree with workspace-write sandboxing and no interactive approval prompt. The external Harness provides the bounded execution context and timeout.

## Claude Code

The Harness uses a configurable non-interactive `claude -p` command and may append a configured max-turn limit when supported by the installed CLI.

## Portability

Runtime commands are configuration, not core governance. If a CLI changes, update the adapter command without changing the workflow/gate/state model.
