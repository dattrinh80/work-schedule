# Evidence Collector

Evidence lives under `.ai/runtime/tasks/<TASK_ID>/evidence/`.

The collector records path, size, SHA-256 checksum and timestamp in a manifest. Typical evidence includes build/test logs, schema results, changed files, security reports, screenshots, approvals and gate outputs.

Agent claims are not evidence.
