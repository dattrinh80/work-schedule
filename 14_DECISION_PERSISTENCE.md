# Decision Persistence

## Decision classes

### Architecture Decision Record (ADR)
Use for long-lived architectural choices.

### Decision Log
Use for implementation-level decisions that matter for reproducibility but do not deserve an ADR.

### Task Assumption
Temporary task-local assumption allowed only when non-blocking and explicitly recorded.

## Persistence rule

No important decision may exist only in chat history.

## Decision record fields

- ID
- Date
- Task ID
- Context
- Decision
- Alternatives
- Rationale
- Impact
- Owner
- Status
- Supersedes
- Related artifacts
