# AI Software Development Harness v3.0 - Master Specification

## 1. Purpose

AI Software Development Harness v3.0 governs AI-assisted delivery from approved requirements to verified code, while preserving architecture, security, contracts, data integrity and auditability.

## 2. Design principles

1. Contract-first.
2. Vertical-slice-first.
3. Evidence-first.
4. Gate-driven completion.
5. Bounded repair loops.
6. Architecture-governed changes.
7. Default-deny tool access.
8. Human approval for high-impact actions.
9. Explicit persistent state.
10. Vendor-neutral core.

## 3. Pipeline

Discovery -> Product Definition -> Solution Foundation -> Experience Foundation -> Backlog -> Vertical Slice Delivery -> Release -> Monitor -> Feedback.

## 4. Harness layers

1. Intent Contract
2. Context Compiler
3. Rules Engine
4. Skill Registry
5. Workflow/Graph Orchestrator
6. Tool Gateway
7. Sandbox
8. Evaluators
9. Quality Gates
10. Observability

## 5. Completion doctrine

A worker may report work complete, but only the harness may transition a task to DONE after all blocking gates pass and the evidence package is complete.

## 6. Parallel execution

Frontend, backend and test work may run in parallel only after the required contracts are approved. Shared-file collisions must be prevented through generated contracts, ownership, locking or serialized integration.

## 7. High-risk actions requiring approval

- Production deployment
- Destructive migration
- Breaking public API change
- Authentication or authorization architecture change
- Secrets/credentials change
- Permission policy change
- Sensitive data transfer
- New dependency when project policy requires approval

## 8. Task types

FEATURE, BUGFIX, REFACTOR, MIGRATION, SECURITY_FIX, UI_REFINEMENT, DOCUMENTATION, RELEASE.

## 9. Core gate outcomes

PASS, REPAIR, HUMAN_REVIEW, BLOCK, RETRY_LATER, CANCELLED.
