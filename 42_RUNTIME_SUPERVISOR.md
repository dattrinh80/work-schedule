# Runtime Supervisor

The supervisor owns process lifecycle, not product decisions.

## Process states

QUEUED -> STARTING -> RUNNING -> EXITED

Terminal interpretations:
- SUCCEEDED
- FAILED
- TIMED_OUT
- CANCELLED

## Supervisor limits

- maximum wall-clock timeout
- optional maximum turns where the runtime supports it
- stdout/stderr capture
- exit-code capture
- process metadata
- worker state synchronization
- no automatic retry beyond configured repair policy

## Principle

A successful process exit is not equivalent to a successful worker.
Worker DONE still requires branch-level verification and evidence.
