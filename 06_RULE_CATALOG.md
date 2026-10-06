# Rule Catalog

## Rule format

Every enforceable rule should include:

- ID
- Objective
- Scope
- Severity
- Applicability
- Statement
- Rationale
- Validation method
- Violation action
- Evidence
- Exception owner
- Version

## Baseline rules

| ID | Rule | Level | Default result |
|---|---|---|---|
| ARCH-001 | Respect module boundaries | Enforcement | BLOCK |
| ARCH-002 | No unapproved public contract change | Constraint + Gate | HUMAN_REVIEW |
| CODE-001 | No unrelated refactor | Constraint | REPAIR |
| CODE-002 | No hard-coded secrets | Enforcement | BLOCK |
| DEP-001 | New dependencies require policy review | Constraint | HUMAN_REVIEW |
| TEST-001 | Changed behavior requires verification | Enforcement | BLOCK |
| SEC-001 | Least privilege | Enforcement | BLOCK |
| DB-001 | Risky migration requires approval | Constraint | HUMAN_REVIEW |
| UI-001 | Use approved design tokens | Enforcement where practical | REPAIR |
| UI-002 | Required UI states must exist | Evidence + Semantic Eval | REPAIR |
