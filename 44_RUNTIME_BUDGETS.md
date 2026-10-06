# Runtime Budgets

The supervisor enforces process-level budgets in addition to Harness repair budgets.

Recommended controls:
- default timeout per worker
- maximum timeout ceiling
- runtime-specific maximum turns where available
- no automatic process retry
- manual or orchestrator-controlled repair routing

Process success only advances a worker to VERIFYING, not DONE.
