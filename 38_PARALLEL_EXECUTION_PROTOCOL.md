# Real Parallel Execution Protocol

## Worker setup

1. Create branch from integration base.
2. Create isolated worktree.
3. Write worker metadata.
4. Claim path lease.
5. Run worker inside assigned worktree.
6. Commit changes to worker branch.
7. Run worker verification.
8. Mark worker DONE.

## Join

All required workers must be DONE.

## Integration

1. Verify worker branches still derive from expected base.
2. Check active leases released.
3. Detect overlapping changed files.
4. Merge/rebase according to policy.
5. Stop on conflicts.
6. Run system verification.
7. Collect merge evidence.
