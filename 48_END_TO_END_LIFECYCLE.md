# End-to-End Lifecycle

```text
/bootstrap or /feature
        |
        v
Task Contract
        |
        v
Requirement Gate
        |
        v
Context + Repository Analysis
        |
        v
Implementation Plan
        |
        v
Architecture Gate
        |
        v
Contracts
        |
        v
Worker Allocation
        |
        +--> FE worktree
        +--> BE worktree
        +--> TEST worktree
        |
        v
Worker Verification
        |
        v
Integration
        |
        v
Quality / Security / UI Gates
        |
        v
Evidence Manifest
        |
        v
Release Gate
        |
        +--> Human Approval if required
        |
        v
DONE
```
