# Worktree Safety

- Main worktree must be clean before worker worktree creation.
- Worker worktrees must not share the same physical path.
- Worker worktree paths are stored outside the main repository tree.
- Uncommitted worker changes block DONE.
- Worktree removal is explicit.
- Integration stops on merge conflict.
