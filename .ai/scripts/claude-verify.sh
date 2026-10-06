#!/usr/bin/env bash
set -euo pipefail

TASK_ID="${1:?usage: claude-verify.sh TASK_ID}"
MAX_TURNS="${MAX_TURNS:-8}"

claude -p   --output-format json   --max-turns "$MAX_TURNS"   "Verify Harness task ${TASK_ID}. Follow CLAUDE.md and .ai/runtime-prompts/verify.md. Do not infer PASS without command/test evidence."
