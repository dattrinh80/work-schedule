# Human Approval Model

## Approval-required changes

Default approval triggers:
- production deploy
- destructive migration
- public API breaking change
- authentication/authorization architecture change
- secrets or credential changes
- permission model change
- sensitive data transfer
- dependency addition when project policy requires it
- broad refactor exceeding task budget
- architecture change affecting multiple modules

## Approval request format

```yaml
approval_request:
  id: APR-001
  task_id: PROJECT-123
  reason: public API breaking change
  requested_by: planner
  impact:
    scope: api
    consumers: [web, mobile]
  alternatives:
    - backward-compatible versioned endpoint
    - breaking replacement
  recommendation: backward-compatible versioned endpoint
  evidence:
    - plan.yaml
    - contract-diff.md
  status: PENDING
```

## Outcomes

APPROVE, REJECT, REQUEST_CHANGES, DEFER.

The task state becomes WAITING_APPROVAL until a valid decision exists.
