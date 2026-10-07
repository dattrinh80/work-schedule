# AI Software Development Harness v4.1 - Production Candidate

## Purpose

v4.1 consolidates the v3.x evolution into one deployable Harness baseline.

## Consolidated lifecycle

Requirement
-> Task Contract
-> Context Compile
-> Plan
-> Architecture Gate
-> Contract Gate
-> Worker Allocation
-> Git-isolated Worker Execution
-> Worker Verification
-> Integration
-> Automated System Gates
-> Evidence Package
-> Human Approval where required
-> DONE

## Production-candidate criteria

- explicit state
- bounded loops
- deterministic gates
- evidence-first completion
- vendor-neutral core
- Codex/Claude adapters
- real worker isolation
- resumable execution
- conflict blocking
- dry-run by default
- CI baseline
- audit trail
