# Autonomous Worker Launcher - v4.0

## Goal

Launch vendor-specific coding workers inside isolated worktrees while preserving Harness governance.

## Responsibilities

- load work item
- resolve worktree
- build runtime prompt
- enforce timeout/turn budget
- launch configured runtime
- capture stdout/stderr
- update worker status
- collect worker evidence
- stop on timeout or non-zero exit
- never grant production access automatically

## Execution modes

- dry-run: render command and prompt without execution
- supervised: run locally with Harness timeout and logs
- external: emit launch package for another supervisor

## Safety

The launcher does not bypass runtime permissions.
The Harness never places secrets into prompts or logs.
