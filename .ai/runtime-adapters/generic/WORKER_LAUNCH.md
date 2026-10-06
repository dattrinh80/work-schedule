# Generic Worker Launch

Configure a command in `.ai/harness/runtime-supervisor.yaml`.

The command must:
- read the prompt from stdin or a referenced prompt file
- execute inside the assigned worktree
- return a meaningful exit code

The Harness controls timeout, logs and state.
