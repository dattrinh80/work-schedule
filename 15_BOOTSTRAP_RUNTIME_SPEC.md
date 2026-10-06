# Bootstrap Runtime Specification

Use when a repository is new or only contains product requirements.

## Entry conditions

At least one source of product intent exists:
- PRD
- product brief
- feature specification
- requirements document

## Runtime sequence

1. INVENTORY
   - inspect repository
   - locate sources of truth
   - detect existing code/toolchain

2. REQUIREMENT NORMALIZATION
   - summarize scope
   - identify unresolved high-impact decisions
   - create initial backlog

3. FOUNDATION DECISIONS
   - stack
   - architecture
   - database
   - security
   - UX/design-system baseline where applicable

4. PROJECT CONTROL PLANE
   - project rules
   - permissions
   - gates
   - validators
   - task/state initialization

5. TOOLCHAIN SETUP
   - lint
   - typecheck
   - test
   - build
   - secret scan
   - architecture checks where practical

6. THIN VERTICAL SLICE
   - choose smallest end-to-end flow
   - implement through FE/BE/DB/auth/test as applicable

7. VERIFICATION
   - run deterministic checks
   - collect evidence
   - record residual risks

8. PROJECT_READY
   - only if blocking gates pass

## Stop conditions

Stop for human decision if:
- architecture choice materially affects project direction
- security model is ambiguous
- data ownership is unclear
- migration/destructive action is required
- requirements conflict
