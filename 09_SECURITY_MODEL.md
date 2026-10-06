# Security Model

## Default posture

Default deny + least privilege.

## Threats

- Prompt/instruction injection from repository content
- Excessive tool permissions
- Secret exposure
- Malicious dependencies
- Command injection
- Path traversal
- Unsafe writes
- Data exfiltration
- Cross-project leakage
- Production access
- Missing audit trail

## Mandatory controls

- Path allowlists
- Shell allowlists
- Network restrictions where available
- No production credentials for normal workers
- Dependency review
- Secret redaction
- Checkpoints and rollback
- Audit logging
- Human approval for high-risk actions
