# Codex Worker Launch

The v4.0 supervisor launches Codex inside the worker worktree.

Recommended non-interactive pattern:

```text
codex exec
  --sandbox workspace-write
  --ask-for-approval never
  -
```

The Harness supplies the worker prompt through stdin, captures output, and applies an external timeout.

Important:
- `--ask-for-approval never` is acceptable only because execution is already isolated in a dedicated worktree and bounded by Harness controls.
- Do not switch to unrestricted sandbox mode.
- Runtime success does not imply Worker DONE.
