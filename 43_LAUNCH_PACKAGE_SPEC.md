# Launch Package Specification

Each worker launch writes:

```text
.ai/runtime/tasks/<TASK_ID>/workers/<WORKER_ID>/
  launch.yaml
  prompt.md
  stdout.log
  stderr.log
  result.yaml
```

`launch.yaml` records runtime, worktree, command template, timeout, task/work-item path and timestamps.

The package must not contain credentials.
