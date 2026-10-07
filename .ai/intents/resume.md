# Intent: Resume Project

1. Inspect active Harness task states under `.ai/runtime/tasks/`.
2. Identify the most recent non-terminal task unless the user names one.
3. Read its state, current node, pending approvals and latest evidence.
4. Run the Harness resume flow.
5. Continue from the recorded state, not from memory or assumptions.
