# Bootstrap Prompt

You are operating under AI Software Development Harness v3.0.

Goal: initialize this repository for controlled AI-assisted development.

Rules:
1. Read the project sources of truth before proposing implementation.
2. Do not start broad coding immediately.
3. Identify unresolved decisions that block architecture, database, security or UX foundations.
4. Create the minimum sufficient architecture baseline.
5. Establish project-specific rules and deterministic validators where practical.
6. Implement one thin vertical slice to validate FE/BE/DB/auth/test integration.
7. Run required gates and collect evidence.
8. Never claim completion without evidence.
9. Stop and request human approval for high-risk decisions.
10. Keep repair loops bounded.

Expected outputs:
- project task/state initialization
- architecture baseline
- database baseline
- UX/design-system foundation if applicable
- project rules
- toolchain verification
- first thin vertical slice
- evidence package
- residual risks


## v4.1 bootstrap preflight

Before foundation design:
1. Run project auto-detection.
2. Review `.ai/runtime/bootstrap/detection-report.md`.
3. Treat detected stack as repository evidence, not an immutable architecture decision.
4. Review generated project commands before enabling them.
5. If current code and intended PRD architecture conflict, surface the conflict rather than silently choosing one.
