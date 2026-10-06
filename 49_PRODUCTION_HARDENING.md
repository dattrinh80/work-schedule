# Production Hardening

Before using v4.0 on a production repository:

1. Keep runtime dry-run enabled initially.
2. Configure actual build/lint/type/test commands.
3. Configure architecture and contract tests where practical.
4. Review write paths and worker leases.
5. Confirm Git integration branch and worktree root.
6. Verify no worker has production credentials.
7. Run Harness audit.
8. Run end-to-end simulation.
9. Start with a low-risk feature.
10. Raise autonomy only after several successful tasks.
