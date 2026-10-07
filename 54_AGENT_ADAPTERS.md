# Agent Adapter Model

Canonical Harness logic lives in:
- `.ai/ENTRYPOINT.md`
- `.ai/intents/*.md`

Adapters are intentionally thin:

- Codex: root `AGENTS.md`
- OpenCode: root `AGENTS.md` (+ optional `.opencode/agents/harness.md`)
- Claude Code: root `CLAUDE.md`
- Gemini CLI: root `GEMINI.md`
- Antigravity: root `AGENTS.md`/`GEMINI.md` plus `.agents/rules/harness.md`

Do not duplicate full workflow logic in vendor-specific files.
