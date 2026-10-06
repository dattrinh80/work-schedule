# Resume and Recovery

## Checkpoint contents

- task state
- workflow/node
- plan version
- contract versions
- gate history
- changed files
- evidence index
- approvals
- unresolved blockers

## Resume sequence

1. Load last valid checkpoint
2. Validate repository/worktree consistency
3. Detect out-of-band changes
4. Recompile minimal context
5. Re-run any stale blocking gate
6. Continue from next valid node

## Unsafe workspace

If the repository differs materially from the checkpoint:
- mark task BLOCKED
- generate workspace-drift report
- do not overwrite unknown changes
