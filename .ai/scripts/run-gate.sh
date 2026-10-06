#!/usr/bin/env sh
set -eu
TASK_ID="${1:?usage: run-gate.sh TASK_ID GATE_ID}"
GATE_ID="${2:?usage: run-gate.sh TASK_ID GATE_ID}"
exec python3 "$(dirname "$0")/../cli/gate_runner.py" "$TASK_ID" "$GATE_ID"
