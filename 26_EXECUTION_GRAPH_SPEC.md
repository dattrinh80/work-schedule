# Execution Graph Specification

Each workflow graph contains:

- entry node
- nodes
- node type
- required inputs
- outputs
- next transitions
- gate dependencies
- repair target
- approval boundary
- terminal states

Example:

```yaml
name: feature
entry: intake

nodes:
  intake:
    type: action
    next: requirement_gate

  requirement_gate:
    type: gate
    gate: G1_REQUIREMENT
    on:
      PASS: compile_context
      REPAIR: intake
      BLOCK: BLOCKED

  done:
    type: terminal
    state: DONE
```
