# Automated Gate Execution - v4.1

Deterministic gate decisions should be made by executable checks, not model confidence.

Gate classes:
- Deterministic: schema, build, lint, typecheck, tests, contract tests, architecture tests, security scans, change budget, evidence completeness.
- Semantic: UX quality, architecture rationale, ambiguous product decisions, visual polish.

A missing deterministic validator is never treated as PASS. It routes to HUMAN_REVIEW or BLOCK.
