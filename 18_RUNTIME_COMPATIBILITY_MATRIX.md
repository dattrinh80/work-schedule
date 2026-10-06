# Runtime Compatibility Matrix - v4.0

This file maps Harness Core concepts to verified runtime capabilities.

| Harness capability | Codex | Claude Code |
|---|---|---|
| Project instructions | `AGENTS.md` hierarchy | `CLAUDE.md` project memory/instructions |
| Project configuration | `.codex/config.toml` for trusted projects | `.claude/settings.json` |
| Read-only planning | sandbox/approval configuration | `--permission-mode plan` |
| Scoped write execution | `sandbox_mode = "workspace-write"` | permission rules / edit approvals |
| Human approval | `approval_policy = "on-request"` | permission prompts / configured permission mode |
| Resume | managed/runtime state | `--resume`, `--continue` |
| Multi-agent | supported in current Codex tooling/config | subagent orchestration supported by current Claude models/runtime |
| Persistent Harness state | `.ai/runtime/**` | `.ai/runtime/**` |
| Harness gates/evidence | Harness Core | Harness Core |

## Policy

Native runtime capabilities are adapters, not sources of governance.
The Harness Core remains authoritative for workflow, gates, evidence and approval boundaries.
