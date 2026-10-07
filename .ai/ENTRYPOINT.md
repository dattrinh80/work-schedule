# AI Software Development Harness Entry Point

This repository uses AI Software Development Harness v4.1.

## Mandatory behavior

When the user gives a natural-language Harness intent, do not explain shell commands unless execution is blocked.
Resolve the intent, read the matching intent file under `.ai/intents/`, and execute the workflow.

Canonical intent examples:

- `Bootstrap project`
- `Build feature: <description>`
- `Fix bug: <description>`
- `Resume project`
- `Verify project`
- `Project status`
- `Prepare release`
- `Audit harness`

## Intent routing

| User intent | Intent file |
|---|---|
| Bootstrap project / Initialize project / Start project from PRD | `.ai/intents/bootstrap.md` |
| Build feature / Add feature / Implement feature | `.ai/intents/feature.md` |
| Fix bug / Repair bug | `.ai/intents/bugfix.md` |
| Resume project / Continue task | `.ai/intents/resume.md` |
| Verify project / Run verification | `.ai/intents/verify.md` |
| Project status / Harness status | `.ai/intents/status.md` |
| Prepare release | `.ai/intents/release.md` |
| Audit harness | `.ai/intents/audit.md` |

## Execution rules

1. Use the Harness CLI and files; do not invent an alternative process.
2. Continue autonomously until one of these conditions is reached:
   - Decision Required
   - Human Approval
   - BLOCK
   - missing execution capability
3. If shell/tool execution is available, execute the intent immediately.
4. If shell/tool execution is not available, report the exact blocked capability and the minimal command the user must run.
5. Never claim a command, gate, test, deployment, or edit succeeded without evidence.
6. Do not silently change approved contracts, architecture, security boundaries, or database strategy.
7. Persist task state and decisions in the repository.
8. Prefer deterministic verification before model judgment.

## Natural-language shorthand

The user should not need to remember implementation commands.
The Harness CLI is an implementation detail behind these intents.
