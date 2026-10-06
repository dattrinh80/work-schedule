# Architecture

```mermaid
flowchart TD
  A[Product Requirement] --> B[Task Contract]
  B --> C[Context Compiler]
  C --> D[Rules Engine]
  C --> E[Skill Registry]
  D --> F[Workflow / Graph Orchestrator]
  E --> F
  F --> G[Planner]
  G --> H[Architecture Gate]
  H -->|PASS| I[Contract Preparation]
  H -->|REPAIR| G
  I --> J1[Frontend Worker]
  I --> J2[Backend Worker]
  I --> J3[Test Worker]
  J1 --> K[Integration]
  J2 --> K
  J3 --> K
  K --> L[Verification]
  L --> M[Quality Gates]
  M -->|REPAIR| N[Repair Router]
  N --> J1
  N --> J2
  N --> J3
  M -->|HUMAN_REVIEW| O[Human Approval]
  M -->|PASS| P[Evidence Package]
  P --> Q[DONE]
```

## Control plane

`.ai/` stores governance, workflows, schemas, runtime state and evidence.

## Project plane

`docs/`, application source and tests contain product-specific implementation and sources of truth.

## Specialist pattern

Software Architect, Database Architect, UX Architect and Security Reviewer are invoked only when their gate or change type requires specialist judgment. They are not permanent workers.
