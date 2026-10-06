# Git Worktree / Branch Isolation - v4.0

## Goal

Run workers in isolated Git branches/worktrees so parallel execution is real, not only logical.

## Model

Each worker receives:
- a dedicated branch
- a dedicated worktree
- a work item
- a path lease
- a base commit
- an evidence directory

## Rules

1. Workers never commit directly to the integration branch.
2. Worker branches are created from a recorded base commit.
3. Worktrees are created outside the main working tree.
4. Integration checks divergence before merge.
5. Merge conflict -> BLOCK, never auto-resolve by guessing.
6. Worker branch deletion happens only after successful integration or explicit cleanup.
