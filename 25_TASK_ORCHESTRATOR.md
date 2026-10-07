# Task Orchestrator & Execution Graph - v4.1

## Purpose

Turn workflow specifications into a stateful, resumable execution engine.

## Core capabilities

- workflow graph loading
- node-by-node progression
- explicit task state transitions
- checkpoint creation
- gate-aware routing
- repair routing
- pause for human approval
- resume after interruption
- bounded iteration
- execution trace

## Orchestrator rule

The orchestrator may advance a task only when the current node's required outputs and gates are satisfied.

Workers never decide the terminal state.
