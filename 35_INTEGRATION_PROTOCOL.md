# Integration Protocol

## Preconditions

- required worker branches DONE
- no active conflicting leases
- worker evidence present
- contract versions unchanged or approved change recorded

## Integration sequence

1. Validate branch outputs.
2. Detect overlapping changed paths.
3. Validate contracts.
4. Merge/apply branch outputs.
5. Run full deterministic verification.
6. Run integration/contract tests.
7. Record integration evidence.
8. Release leases.
9. Continue to system-level gates.

## Conflict handling

If two workers modify the same path:
- BLOCK integration
- identify owner
- choose one authoritative branch
- rebase/reapply the other branch if still needed
- rerun verification
