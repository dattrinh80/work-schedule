# Bootstrap Engine Flow

```text
COPY HARNESS INTO REPO
        |
        v
PROJECT DETECTION
        |
        +-- package manager
        +-- framework(s)
        +-- monorepo
        +-- datastore signals
        +-- Docker
        +-- existing scripts
        |
        v
PROJECT PROFILE
        |
        v
GENERATED COMMAND PROPOSAL
        |
        v
HUMAN / AGENT REVIEW
        |
        v
APPROVED project-commands.yaml
        |
        v
FOUNDATION DECISIONS
        |
        v
THIN VERTICAL SLICE
        |
        v
VERIFY
        |
        v
PROJECT_READY
```

Detection is evidence gathering. It does not override PRD, ADR or approved architecture.
