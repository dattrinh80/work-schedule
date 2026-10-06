# Gate Policy

- PASS: required deterministic checks passed and no blocking review remains.
- REPAIR: repairable deterministic failure exists.
- HUMAN_REVIEW: deterministic evidence is insufficient for a blocking decision.
- BLOCK: policy/evidence prevents safe progression.
- RETRY_LATER: external dependency prevents evaluation.
- CANCELLED: gate is explicitly not applicable.

Missing verification is never silent success.
