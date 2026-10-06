# Feature Runtime Specification

## Entry

A FEATURE task contract exists.

## Execution

```text
INTAKE
 -> REQUIREMENT_GATE
 -> CONTEXT_COMPILE
 -> REPOSITORY_ANALYSIS
 -> IMPLEMENTATION_PLAN
 -> ARCHITECTURE_GATE
 -> CONTRACT_PREPARATION
 -> CONTRACT_GATE
 -> WORKERS
 -> INTEGRATION
 -> VERIFY
 -> REVIEW
 -> EVIDENCE
 -> DONE
```

## Parallel worker rule

Frontend, backend and tests may fan out only after contracts are ready.

## Contract drift rule

If a worker discovers that the approved contract is not implementable:
- stop changing the contract silently
- emit CONTRACT_CHANGE_REQUEST
- return task to contract preparation
- rerun affected gates

## Completion rule

DONE requires:
- acceptance criteria satisfied
- blocking gates PASS
- evidence complete
- required approvals present
