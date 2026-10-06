# Checkpoint Model

The orchestrator creates checkpoints:

- at execution initialization
- after action nodes
- after blocking gates
- before/after approval boundaries
- when parallel branches are opened/joined
- on terminal states

Checkpoints persist state, not full repository snapshots.

Repository rollback remains a version-control responsibility.
