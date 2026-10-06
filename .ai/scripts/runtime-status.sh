#!/usr/bin/env sh
set -eu
exec python3 "$(dirname "$0")/../cli/runtime_supervisor.py" "$@"
