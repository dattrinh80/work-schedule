# State Model

## Primary lifecycle

CREATED -> INTAKE -> CONTEXT_READY -> PLANNED -> READY_FOR_IMPLEMENTATION -> IMPLEMENTING -> INTEGRATING -> VERIFYING -> REVIEWING -> DONE

## Auxiliary states

REPAIRING, BLOCKED, WAITING_APPROVAL, FAILED, CANCELLED.

## Rules

- Conversation history is not the state store.
- Every transition is persisted.
- Every gate result is recorded.
- Checkpoints are created after blocking gates and before risky operations.
- Sensitive data must be redacted from state and traces.
- No-progress detection may restore the last stable checkpoint and escalate.
