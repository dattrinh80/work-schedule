# Intent: Build Feature

Trigger examples:
- Build feature: ...
- Add feature: ...
- Implement feature: ...

## Execute

1. Convert the user's requested change into a Harness task contract.
2. Create a feature task using the canonical CLI.
3. Initialize the feature execution graph.
4. Progress through requirement, architecture, contract, worker, integration, verification and evidence stages.
5. Use isolated workers only after contracts are stable.
6. Continue until a required approval/decision/block or task completion.

Never skip acceptance criteria or evidence.
