# Vendor Adapter Notes - verified October 2026

## Codex

Current OpenAI documentation confirms:
- `AGENTS.md` is automatically discovered and merged hierarchically.
- Local Codex clients support user and project `config.toml`; project config is loaded only for trusted projects.
- `approval_policy = "on-request"` and `sandbox_mode = "workspace-write"` are current supported configuration patterns.
- `approval_policy = "untrusted"` is no longer supported.
- Current Codex supports multi-agent configuration/tools.
- OpenAI's agent/sandbox architecture explicitly separates harness/control plane from sandbox compute.

Harness consequence:
- Use `AGENTS.md` for concise governing instructions.
- Use `.codex/config.toml` for conservative project defaults.
- Keep `.ai/` as workflow/state/evidence source of truth.

## Claude Code

Current Anthropic documentation confirms:
- Project instructions/memory can be stored in `CLAUDE.md`.
- Claude Code supports project settings and allow/deny tool permission rules.
- Permission modes include `plan`; CLI supports resume/continue.
- Noninteractive mode supports JSON output and `--max-turns`.
- Hooks can participate in runtime permission evaluation.
- Bypassing permissions exists but should be treated as high risk.

Harness consequence:
- Use `CLAUDE.md` for shared project governance.
- Use `.claude/settings.json` conservatively.
- Use plan mode for planning and normal permission mode for implementation.
- Keep bounded automation and state/evidence enforcement in Harness Core.
